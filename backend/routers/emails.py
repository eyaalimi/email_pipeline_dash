from fastapi import APIRouter, Depends, Query, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from datetime import datetime
from database import get_db
from models import Email
from schemas import EmailOut, EmailCreate, PaginatedEmails
import os
import shutil

router = APIRouter(prefix="/api/emails", tags=["emails"])

UPLOADS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)


@router.get("", response_model=PaginatedEmails)
def list_emails(
    page: int = Query(1, ge=1),
    per_page: int = Query(15, ge=1, le=100),
    status: str = Query(None),
    search: str = Query(None),
    date_from: str = Query(None),
    date_to: str = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(Email).filter(Email.deleted == False)
    if status:
        q = q.filter(Email.status == status)
    if search:
        term = f"%{search}%"
        q = q.filter(or_(Email.subject.ilike(term), Email.sender.ilike(term), Email.recipient.ilike(term)))
    if date_from:
        q = q.filter(Email.received_date >= datetime.fromisoformat(date_from))
    if date_to:
        q = q.filter(Email.received_date <= datetime.fromisoformat(date_to))

    total = q.count()
    items = q.order_by(Email.received_date.desc()).offset((page - 1) * per_page).limit(per_page).all()
    return PaginatedEmails(items=[EmailOut.model_validate(e) for e in items], total=total, page=page, per_page=per_page)


@router.get("/{email_id}", response_model=EmailOut)
def get_email(email_id: int, db: Session = Depends(get_db)):
    email = db.query(Email).filter(Email.id == email_id, Email.deleted == False).first()
    if not email:
        raise HTTPException(404, "Email not found")
    return EmailOut.model_validate(email)


@router.post("", response_model=EmailOut)
async def create_email(
    subject: str = Form(...),
    sender: str = Form(...),
    recipient: str = Form(...),
    received_date: str = Form(...),
    body_preview: str = Form(""),
    pdf: UploadFile = File(None),
    db: Session = Depends(get_db),
):
    pdf_filename = ""
    pdf_path = ""
    if pdf and pdf.filename:
        pdf_filename = pdf.filename
        pdf_path = os.path.join(UPLOADS_DIR, f"{datetime.utcnow().timestamp()}_{pdf.filename}")
        with open(pdf_path, "wb") as f:
            shutil.copyfileobj(pdf.file, f)

    email = Email(
        subject=subject,
        sender=sender,
        recipient=recipient,
        received_date=datetime.fromisoformat(received_date),
        body_preview=body_preview[:200],
        pdf_filename=pdf_filename,
        pdf_path=pdf_path,
    )
    db.add(email)
    db.commit()
    db.refresh(email)
    return EmailOut.model_validate(email)


@router.delete("/{email_id}")
def delete_email(email_id: int, db: Session = Depends(get_db)):
    email = db.query(Email).filter(Email.id == email_id).first()
    if not email:
        raise HTTPException(404, "Email not found")
    email.deleted = True
    db.commit()
    return {"ok": True}


@router.post("/bulk-delete")
def bulk_delete(email_ids: list[int], db: Session = Depends(get_db)):
    db.query(Email).filter(Email.id.in_(email_ids)).update({"deleted": True}, synchronize_session=False)
    db.commit()
    return {"ok": True}
