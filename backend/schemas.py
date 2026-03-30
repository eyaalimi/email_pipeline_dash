from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class EmailCreate(BaseModel):
    subject: str
    sender: str
    recipient: str
    received_date: datetime
    body_preview: str = ""
    pdf_filename: str = ""


class EmailOut(BaseModel):
    id: int
    subject: str
    sender: str
    recipient: str
    received_date: datetime
    body_preview: str
    pdf_filename: str
    pdf_path: str
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PipelineRunOut(BaseModel):
    id: int
    email_id: int
    started_at: datetime
    completed_at: Optional[datetime]
    status: str
    agent1_output: str
    agent2_output_path: str
    error_message: Optional[str]
    logs: str
    email_subject: Optional[str] = None

    class Config:
        from_attributes = True


class StatsOut(BaseModel):
    total_emails: int
    completed: int
    pending: int
    processing: int
    error: int
    success_rate: float
    avg_processing_seconds: float


class PaginatedEmails(BaseModel):
    items: list[EmailOut]
    total: int
    page: int
    per_page: int
