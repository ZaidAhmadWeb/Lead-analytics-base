from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from database import get_db
from models import Agent, Lead

router = APIRouter()

@router.get("/agents/workload")
def get_agent_workload(db: Session = Depends(get_db)):
    """
    Returns the current open lead count for every agent.
    Requirement: Part 2, Item 3.
    """
    # We join Agents with Leads but only count leads that are NOT Closed or Rejected
    # This represents the agent's current 'active' workload.
    results = (
        db.query(
            Agent.id,
            Agent.name,
            func.count(Lead.id).label("open_leads_count")
        )
        .outerjoin(Lead, (Agent.id == Lead.agent_id) & (Lead.status.in_(["Open", "Accepted"])))
        .group_by(Agent.id, Agent.name)
        .order_by(Agent.name)
        .all()
    )

    return [
        {
            "id": r.id,
            "name": r.name,
            "open_count": r.open_leads_count
        }
        for r in results
    ]

@router.get("/agents/{agent_id}")
def get_agent_detail(agent_id: int, db: Session = Depends(get_db)):
    """
    Fetches the details of a single agent by their ID.
    Used by the React frontend to display the agent's name on the leads page.
    """
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
        
    return {
        "id": agent.id,
        "name": agent.name,
        "max_capacity": agent.max_capacity,
        "created_at": agent.created_at
    }

@router.get("/agents/{agent_id}/leads")
def get_agent_leads(agent_id: int, db: Session = Depends(get_db)):
    """
    Fetches leads for an agent, prioritized so 'Open' status is at the top.
    """
    # Define the priority: Open gets 1, everything else gets 2
    status_priority = case(
        (Lead.status == "Open", 1),
        else_=2
    )

    leads = (
        db.query(Lead)
        .filter(Lead.agent_id == agent_id)
        .order_by(status_priority, Lead.created_at.desc()) # Sort by priority, then by newest
        .all()
    )
    
    return [lead.to_dict() for lead in leads]