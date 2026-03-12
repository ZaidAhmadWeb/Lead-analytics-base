from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, case, asc, desc
from database import get_db
from models import Lead, Agent, LeadHistory

router = APIRouter()

@router.get("/analytics")
def get_analytics(db: Session = Depends(get_db)):

    result = db.query(
        func.count(Lead.id).label("total_leads"),
        func.sum(case((Lead.status == "Converted", 1), else_=0)).label("converted")
    ).one()

    total_leads = int(result.total_leads or 0)
    converted = int(result.converted or 0)

    conversion_rate = (converted / total_leads * 100) if total_leads > 0 else 0

    total_revenue = total_leads * 100

    return {
        "total_leads": total_leads,
        "conversion_rate": round(conversion_rate, 2),
        "total_revenue": total_revenue
    }

@router.get("/analytics/leads-by-source")
def leads_by_source(db: Session = Depends(get_db)):
    """Get lead count grouped by source."""

    results = (
        db.query(
            Lead.source,
            func.count(Lead.id).label("count")
        )
        .group_by(Lead.source)
        .all()
    )

    return {r.source: r.count for r in results}


# optimized version for leads which reads 5 records at a time
# this function puts the heavy load on DB instead of server
@router.get("/analytics/top-agents")
def top_agents(db: Session = Depends(get_db)):
    # Define conditional logic for aggregations
    converted_case = case((Lead.status == "Converted", 1), else_=0)
    revenue_case = case((Lead.status == "Converted", Lead.revenue), else_=0)

    # Updated query with Join
    query = (
        db.query(
            Agent.name.label("agent_name"), # Get name from Agent table
            func.count(Lead.id).label("total_leads"),
            func.sum(converted_case).label("converted"),
            func.sum(revenue_case).label("revenue"),
        )
        .join(Lead, Agent.id == Lead.agent_id) # Join on your new foreign key
        .group_by(Agent.id, Agent.name)
        .order_by(func.sum(converted_case).desc()) # Converted leads is for "Top" ranking
        .limit(5)
    )

    results = query.all()

    return [
        {
            "agent_name": r.agent_name,
            "total_leads": r.total_leads,
            "converted": int(r.converted or 0),
            "revenue": float(r.revenue or 0)
        }
        for r in results
    ]


@router.get("/leads")
def get_leads(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    sort: str = Query("desc", regex="^(asc|desc)$"),
    db: Session = Depends(get_db)
):
    """Fetch leads with pagination and sorting by date_created."""

    query = db.query(Lead)

    if sort == "asc":
        query = query.order_by(asc(Lead.created_at))
    else:
        query = query.order_by(desc(Lead.created_at))

    leads = (
        query
        .offset(skip)
        .limit(limit)
        .all()
    )

    return [lead.to_dict() for lead in leads]