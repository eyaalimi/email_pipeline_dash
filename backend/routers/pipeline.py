from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from database import get_db, SessionLocal
from models import Email, PipelineRun
from schemas import PipelineRunOut
from services.pipeline_service import run_pipeline
from datetime import datetime, timezone
import asyncio

router = APIRouter(prefix="/api/pipeline", tags=["pipeline"])


@router.post("/run/{email_id}", response_model=PipelineRunOut)
async def trigger_pipeline(email_id: int, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    email = db.query(Email).filter(Email.id == email_id, Email.deleted == False).first()
    if not email:
        raise HTTPException(404, "Email not found")
    if email.status == "processing":
        raise HTTPException(400, "Pipeline already running for this email")

    # Create the run record here so we can return it immediately
    email.status = "processing"
    run = PipelineRun(email_id=email_id, status="running")
    db.add(run)
    db.commit()
    db.refresh(run)

    # Launch pipeline in background
    asyncio.ensure_future(run_pipeline(email_id, run.id, SessionLocal))

    return PipelineRunOut(
        id=run.id, email_id=email_id, started_at=run.started_at,
        completed_at=None, status="running", agent1_output="",
        agent2_output_path="", error_message=None, logs="",
        email_subject=email.subject,
    )


@router.post("/run-batch")
async def trigger_batch(email_ids: list[int], db: Session = Depends(get_db)):
    results = []
    for eid in email_ids:
        email = db.query(Email).filter(Email.id == eid, Email.deleted == False).first()
        if email and email.status != "processing":
            email.status = "processing"
            run = PipelineRun(email_id=eid, status="running")
            db.add(run)
            db.commit()
            db.refresh(run)
            asyncio.ensure_future(run_pipeline(eid, run.id, SessionLocal))
            results.append({"email_id": eid, "triggered": True})
        else:
            results.append({"email_id": eid, "triggered": False})
    return results


@router.get("/runs", response_model=list[PipelineRunOut])
def list_runs(
    status: str = None,
    email_id: int = None,
    page: int = 1,
    per_page: int = 20,
    db: Session = Depends(get_db),
):
    q = db.query(PipelineRun)
    if status:
        q = q.filter(PipelineRun.status == status)
    if email_id:
        q = q.filter(PipelineRun.email_id == email_id)
    runs = q.order_by(PipelineRun.started_at.desc()).offset((page - 1) * per_page).limit(per_page).all()
    result = []
    for r in runs:
        email = db.query(Email).filter(Email.id == r.email_id).first()
        result.append(PipelineRunOut(
            id=r.id, email_id=r.email_id, started_at=r.started_at,
            completed_at=r.completed_at, status=r.status,
            agent1_output=r.agent1_output, agent2_output_path=r.agent2_output_path,
            error_message=r.error_message, logs=r.logs,
            email_subject=email.subject if email else None,
        ))
    return result


@router.get("/runs/{run_id}", response_model=PipelineRunOut)
def get_run(run_id: int, db: Session = Depends(get_db)):
    run = db.query(PipelineRun).filter(PipelineRun.id == run_id).first()
    if not run:
        raise HTTPException(404, "Run not found")
    email = db.query(Email).filter(Email.id == run.email_id).first()
    return PipelineRunOut(
        id=run.id, email_id=run.email_id, started_at=run.started_at,
        completed_at=run.completed_at, status=run.status,
        agent1_output=run.agent1_output, agent2_output_path=run.agent2_output_path,
        error_message=run.error_message, logs=run.logs,
        email_subject=email.subject if email else None,
    )
