from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from database import Base


class Email(Base):
    __tablename__ = "emails"

    id = Column(Integer, primary_key=True, autoincrement=True)
    subject = Column(Text, nullable=False)
    sender = Column(Text, nullable=False)
    recipient = Column(Text, nullable=False)
    received_date = Column(DateTime, nullable=False)
    body_preview = Column(Text, default="")
    pdf_filename = Column(Text, default="")
    pdf_path = Column(Text, default="")
    status = Column(Text, default="pending")  # pending/processing/completed/error
    deleted = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    pipeline_runs = relationship("PipelineRun", back_populates="email", order_by="PipelineRun.started_at.desc()")


class PipelineRun(Base):
    __tablename__ = "pipeline_runs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    email_id = Column(Integer, ForeignKey("emails.id"), nullable=False)
    started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)
    status = Column(Text, default="running")  # running/success/failed
    agent1_output = Column(Text, default="")  # JSON string
    agent2_output_path = Column(Text, default="")
    error_message = Column(Text, nullable=True)
    logs = Column(Text, default="")

    email = relationship("Email", back_populates="pipeline_runs")
