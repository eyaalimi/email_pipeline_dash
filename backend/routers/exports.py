from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from database import get_db
from models import PipelineRun, Email
from services.export_service import generate_excel, generate_csv, EXPORTS_DIR
import os
import json
import zipfile
import tempfile

router = APIRouter(prefix="/api/exports", tags=["exports"])


@router.get("/excel/{email_id}")
def export_excel(email_id: int, db: Session = Depends(get_db)):
    run = db.query(PipelineRun).filter(
        PipelineRun.email_id == email_id, PipelineRun.status == "success"
    ).order_by(PipelineRun.id.desc()).first()
    if not run or not run.agent1_output:
        raise HTTPException(404, "No successful pipeline run found for this email")

    if run.agent2_output_path and os.path.exists(os.path.join(EXPORTS_DIR, run.agent2_output_path)):
        return FileResponse(
            os.path.join(EXPORTS_DIR, run.agent2_output_path),
            filename=run.agent2_output_path,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )

    filename = generate_excel(run.agent1_output, email_id, run.id)
    run.agent2_output_path = filename
    db.commit()
    return FileResponse(
        os.path.join(EXPORTS_DIR, filename),
        filename=filename,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )


@router.get("/csv/{email_id}")
def export_csv(email_id: int, db: Session = Depends(get_db)):
    run = db.query(PipelineRun).filter(
        PipelineRun.email_id == email_id, PipelineRun.status == "success"
    ).order_by(PipelineRun.id.desc()).first()
    if not run or not run.agent1_output:
        raise HTTPException(404, "No successful pipeline run found for this email")

    filename = generate_csv(run.agent1_output, email_id, run.id)
    return FileResponse(
        os.path.join(EXPORTS_DIR, filename),
        filename=filename,
        media_type="text/csv",
    )


@router.get("/json/{email_id}")
def get_json_output(email_id: int, db: Session = Depends(get_db)):
    run = db.query(PipelineRun).filter(
        PipelineRun.email_id == email_id, PipelineRun.status == "success"
    ).order_by(PipelineRun.id.desc()).first()
    if not run or not run.agent1_output:
        raise HTTPException(404, "No successful pipeline run found")
    return json.loads(run.agent1_output)


@router.post("/bulk-excel")
def bulk_export_excel(email_ids: list[int], db: Session = Depends(get_db)):
    files = []
    for eid in email_ids:
        run = db.query(PipelineRun).filter(
            PipelineRun.email_id == eid, PipelineRun.status == "success"
        ).order_by(PipelineRun.id.desc()).first()
        if run and run.agent1_output:
            fname = generate_excel(run.agent1_output, eid, run.id)
            files.append(os.path.join(EXPORTS_DIR, fname))

    if not files:
        raise HTTPException(404, "No exports available")

    zip_path = os.path.join(EXPORTS_DIR, "bulk_export.zip")
    with zipfile.ZipFile(zip_path, "w") as zf:
        for f in files:
            zf.write(f, os.path.basename(f))

    return FileResponse(zip_path, filename="bulk_export.zip", media_type="application/zip")
