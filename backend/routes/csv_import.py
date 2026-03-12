from datetime import datetime

from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, case, asc, desc
from database import get_db
from models import Lead, Agent, LeadHistory
import csv
import io

router = APIRouter()

def get_available_agent(db):

    agent = (
        db.query(Agent)
        .outerjoin(Lead, Lead.agent_id == Agent.id)
        .group_by(Agent.id)
        .order_by(func.count(Lead.id))
        .first()
    )

    return agent

def assign_lead_to_agent(db, lead):
    """
    Finds agent with fewest open leads (< 10). 
    If all full, status remains 'Pending'.
    """
    # Subquery to count open leads per agent
    # Open leads = status NOT in ['Closed', 'Rejected'] (or as per your definition)
    agent = (
        db.query(Agent)
        .outerjoin(Lead, Lead.agent_id == Agent.id)
        .filter(Lead.status.in_(['Open', 'Accepted'])) # Only count active workload
        .group_by(Agent.id)
        .having(func.count(Lead.id) < Agent.max_capacity)
        .order_by(func.count(Lead.id).asc())
        .first()
    )

    if agent:
        lead.agent_id = agent.id
        lead.status = "Open"
    else:
        lead.agent_id = None
        lead.status = "Pending" # Decision: Queue leads if all agents are at capacity [cite: 40]
    
    return lead

def get_next_available_agent(db):
    # Rule: Assign to agent with fewest open leads [cite: 26]
    # Agent must have < 10 open leads [cite: 27]
    agent = (
        db.query(Agent)
        .outerjoin(Lead, Lead.agent_id == Agent.id)
        .filter(Lead.status.in_(["Open", "Accepted"]))
        .group_by(Agent.id)
        .having(func.count(Lead.id) < 10)
        .order_by(func.count(Lead.id).asc())
        .first()
    )
    return agent

BATCH_SIZE = 5000
@router.post("/upload-csv")
async def upload_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    leads_added = 0
    batch = []
    
    stream = io.TextIOWrapper(file.file, encoding="utf-8")
    reader = csv.DictReader(stream)

    # 1. Load all agents and their CURRENT real-time open counts into a local dict
    agents = db.query(Agent).all()
    agent_workload = {}
    
    for agent in agents:
        current_count = (
            db.query(func.count(Lead.id))
            .filter(Lead.agent_id == agent.id, Lead.status != "Converted") # Use your specific 'Closed' status
            .scalar() or 0
        )
        agent_workload[agent.id] = {
            "object": agent,
            "current_open": current_count
        }

    for row in reader:
        assigned_agent_id = None
        status = "Pending"

        # 2. Find an agent from our local tracker who has capacity
        # We sort by current_open to distribute leads evenly (Round Robin-ish)
        available_agents = [
            info for info in agent_workload.values() 
            if info["current_open"] < info["object"].max_capacity
        ]
        
        if available_agents:
            # Pick the agent with the most remaining room
            target = min(available_agents, key=lambda x: x["current_open"])
            
            assigned_agent_id = target["object"].id
            status = "Open"
            
            # 3. CRITICAL: Increment local count so the NEXT lead in the loop 
            # knows this agent just took one more
            target["current_open"] += 1

        batch.append({
            "source": row.get("Source", ""),
            "status": status,
            "revenue": float(row.get("Revenue", 0) or 0),
            "created_at": row.get("CreatedAt"),
            "agent_id": assigned_agent_id
        })

        if len(batch) >= BATCH_SIZE:
            db.bulk_insert_mappings(Lead, batch)
            db.commit()
            leads_added += len(batch)
            batch.clear()

    if batch:
        db.bulk_insert_mappings(Lead, batch)
        db.commit()
        leads_added += len(batch)

    return {"message": f"Successfully uploaded {leads_added} leads"}

@router.post("/upload-csv-batch")
async def upload_csv_batch(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Batch upload with error handling for individual rows."""

    content = await file.read()
    decoded = content.decode("utf-8")
    reader = csv.DictReader(io.StringIO(decoded))

    leads_added = 0
    errors = []

    for row in reader:
        try:
            lead = Lead(
                agent_name=row.get("Agent", ""),
                source=row.get("Source", ""),
                status=row.get("Status", ""),
                revenue=float(row.get("Revenue", 0)),
                created_at=row.get("CreatedAt")
            )
            db.add(lead)
            db.commit()
            leads_added += 1
        except Exception as e:
            errors.append(str(e))
            db.rollback()

    return {"message": f"Uploaded {leads_added} leads", "errors": errors}


@router.patch("/leads/{lead_id}/status")
async def update_status(lead_id: int, status_update: dict, db: Session = Depends(get_db)):
    new_status = status_update.get("status")
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    
    if not lead:
        return {"error": "Lead not found"}, 404

    old_status = lead.status
    old_agent_id = lead.agent_id
    
    # 1. Audit Trail: Always record the change
    history = LeadHistory(
        lead_id=lead.id, 
        old_status=old_status, 
        new_status=new_status,
        changed_at=datetime.utcnow()
    )
    db.add(history)
    
    # 2. Reassignment Logic for "Rejected"
    if new_status == "Rejected":
        # Rule: Find agent with fewest leads, EXCLUDING the current agent
        next_agent = (
            db.query(Agent)
            .outerjoin(Lead, (Agent.id == Lead.agent_id) & (Lead.status.in_(["Open", "Accepted"])))
            .filter(Agent.id != old_agent_id) # Don't give it back to the same person
            .group_by(Agent.id)
            .having(func.count(Lead.id) < 10)
            .order_by(func.count(Lead.id).asc())
            .first()
        )
        
        if next_agent:
            lead.agent_id = next_agent.id
            lead.status = "Open"
        else:
            # Open Requirement Decision: If no one else can take it, it goes to Pending queue
            lead.agent_id = None
            lead.status = "Pending"
    else:
        # For 'Accepted' or 'Converted' (Close)
        lead.status = 'Converted'

    db.commit()
    return lead.to_dict()