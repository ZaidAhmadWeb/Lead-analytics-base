from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from database import Base
from datetime import datetime

class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    source = Column(String)
    status = Column(String, default="Open")
    revenue = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

    agent_id = Column(Integer, ForeignKey("agents.id"))

    def to_dict(self):
        return {
            "id": self.id,
            "agent_id": self.agent_id,
            "source": self.source,
            "status": self.status,
            "revenue": self.revenue,
            "created_at": str(self.created_at)
        }


class Agent(Base):
    __tablename__ = "agents"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    max_capacity = Column(Integer, default=10)
    created_at = Column(DateTime, default=datetime.utcnow)

class LeadHistory(Base):
    __tablename__ = "lead_history"

    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.id"))
    old_status = Column(String)
    new_status = Column(String)
    changed_at = Column(DateTime, default=datetime.utcnow)