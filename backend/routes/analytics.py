from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, case, asc, desc
from database import get_db
from models import Lead

router = APIRouter()


# @router.get("/analytics")
# def get_analytics(db: Session = Depends(get_db)):
#     """Get analytics metrics for the dashboard."""

#     all_leads = db.query(Lead).all()

#     total_leads = len(all_leads)

#     total_revenue = 0
#     converted = 0
#     for lead in all_leads:
#         if lead.status == "Converted":
#             converted += 1
#             total_revenue += lead.revenue # add for calculation of total revenue number

#     conversion_rate = (converted / total_leads * 100) if total_leads > 0 else 0

#     # Calculate estimated revenue based on average deal size
#     # total_revenue = total_leads * 100 #removed this line

#     return {
#         "total_leads": total_leads,
#         "conversion_rate": round(conversion_rate, 2),
#         "total_revenue": total_revenue,
#     }


@router.get("/analytics")
def get_analytics(db: Session = Depends(get_db)):
    """Get analytics metrics for the dashboard."""

    result = db.query(
        func.count(Lead.id).label("total_leads"),
        func.sum(
            case((Lead.status == "Converted", 1), else_=0)
        ).label("converted"),
        func.sum(
            case((Lead.status == "Converted", Lead.revenue), else_=0)
        ).label("total_revenue"),
    ).one()

    total_leads = result.total_leads or 0
    converted = result.converted or 0
    total_revenue = result.total_revenue or 0

    conversion_rate = (converted / total_leads * 100) if total_leads > 0 else 0

    return {
        "total_leads": total_leads,
        "conversion_rate": round(conversion_rate, 2),
        "total_revenue": total_revenue,
    }


# @router.get("/analytics/leads-by-source")
# def leads_by_source(db: Session = Depends(get_db)):
#     """Get lead count grouped by source."""

#     all_leads = db.query(Lead).all()

#     source_counts = {}
#     for lead in all_leads:
#         source = lead.source
#         if source in source_counts:
#             source_counts[source] += 1
#         else:
#             source_counts[source] = 1

#     return source_counts

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




# old /analytics/top-agents end point which loads the entrie 
# @router.get("/analytics/top-agents")
# def top_agents(db: Session = Depends(get_db)):
#     """Get top performing agents by number of converted leads."""

#     all_leads = db.query(Lead).all()

#     agent_stats = {}
#     for lead in all_leads:
#         agent = lead.agent_name
#         if agent not in agent_stats:
#             agent_stats[agent] = {"total": 0, "converted": 0, "revenue": 0}

#         agent_stats[agent]["total"] += 1
#         if lead.status == "Converted":
#             agent_stats[agent]["converted"] += 1
#             agent_stats[agent]["revenue"] += lead.revenue

#     sorted_agents = sorted(agent_stats.items(), key=lambda x: x[1]["converted"], reverse=True)

#     result = []
#     for agent_name, stats in sorted_agents[:5]:
#         result.append({
#             "agent_name": agent_name,
#             "total_leads": stats["total"],
#             "converted": stats["converted"],
#             "revenue": stats["revenue"]
#         })

#     return result


# optimized version for leads which reads 5 records at a time
# this function puts the heavy load on DB instead of server
@router.get("/analytics/top-agents")
def top_agents(db: Session = Depends(get_db)):

    converted_case = case(
        (Lead.status == "Converted", 1),
        else_=0
    )

    revenue_case = case(
        (Lead.status == "Converted", Lead.revenue),
        else_=0
    )

    query = (
        db.query(
            Lead.agent_name.label("agent_name"),
            func.count(Lead.id).label("total_leads"),
            func.sum(converted_case).label("converted"),
            func.sum(revenue_case).label("revenue"),
        )
        .group_by(Lead.agent_name)
        .order_by(func.sum(converted_case).desc())
        .limit(5)
    )

    results = query.all()

    return [
        {
            "agent_name": r.agent_name,
            "total_leads": r.total_leads,
            "converted": r.converted,
            "revenue": r.revenue or 0
        }
        for r in results
    ]


# @router.get("/leads")
# def get_leads(db: Session = Depends(get_db)):
#     """Fetch all leads."""

#     leads = db.query(Lead).all()
#     return [lead.to_dict() for lead in leads]


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