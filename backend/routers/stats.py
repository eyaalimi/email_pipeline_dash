from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models import Email, PipelineRun
from schemas import StatsOut

router = APIRouter(prefix="/api/stats", tags=["stats"])


@router.get("", response_model=StatsOut)
def get_stats(db: Session = Depends(get_db)):
    total = db.query(Email).filter(Email.deleted == False).count()
    completed = db.query(Email).filter(Email.deleted == False, Email.status == "completed").count()
    pending = db.query(Email).filter(Email.deleted == False, Email.status == "pending").count()
    processing = db.query(Email).filter(Email.deleted == False, Email.status == "processing").count()
    error = db.query(Email).filter(Email.deleted == False, Email.status == "error").count()

    total_runs = db.query(PipelineRun).filter(PipelineRun.status.in_(["success", "failed"])).count()
    success_runs = db.query(PipelineRun).filter(PipelineRun.status == "success").count()
    success_rate = (success_runs / total_runs * 100) if total_runs > 0 else 0

    avg_seconds = 0
    completed_runs = db.query(PipelineRun).filter(PipelineRun.status == "success", PipelineRun.completed_at.isnot(None)).all()
    if completed_runs:
        durations = [(r.completed_at - r.started_at).total_seconds() for r in completed_runs if r.completed_at and r.started_at]
        avg_seconds = sum(durations) / len(durations) if durations else 0

    return StatsOut(
        total_emails=total, completed=completed, pending=pending,
        processing=processing, error=error,
        success_rate=round(success_rate, 1),
        avg_processing_seconds=round(avg_seconds, 1),
    )


@router.get("/volume")
def get_volume(db: Session = Depends(get_db)):
    """Processing volume grouped by date."""
    runs = db.query(
        func.date(PipelineRun.started_at).label("date"),
        func.count().label("count"),
        func.sum(func.case((PipelineRun.status == "success", 1), else_=0)).label("success"),
        func.sum(func.case((PipelineRun.status == "failed", 1), else_=0)).label("failed"),
    ).group_by(func.date(PipelineRun.started_at)).order_by(func.date(PipelineRun.started_at)).all()

    return [{"date": str(r.date), "count": r.count, "success": r.success, "failed": r.failed} for r in runs]


@router.get("/activity")
def get_activity(db: Session = Depends(get_db)):
    """Last 10 pipeline events."""
    runs = db.query(PipelineRun).order_by(PipelineRun.started_at.desc()).limit(10).all()
    result = []
    for r in runs:
        email = db.query(Email).filter(Email.id == r.email_id).first()
        result.append({
            "run_id": r.id,
            "email_id": r.email_id,
            "email_subject": email.subject if email else "Unknown",
            "status": r.status,
            "started_at": r.started_at.isoformat() if r.started_at else None,
            "completed_at": r.completed_at.isoformat() if r.completed_at else None,
        })
    return result
