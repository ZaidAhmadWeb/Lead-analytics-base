from sqlalchemy import Column, Integer, String, Float, DateTime
from database import Base
from datetime import datetime


class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    agent_name = Column(String)
    source = Column(String)
    status = Column(String)
    revenue = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "agent_name": self.agent_name,
            "source": self.source,
            "status": self.status,
            "revenue": self.revenue,
            "created_at": str(self.created_at)
        }
