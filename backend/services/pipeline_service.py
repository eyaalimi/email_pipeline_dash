import asyncio
import json
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from models import Email, PipelineRun
from services.agent_service import agent_service
from services.export_service import generate_excel
from websocket_manager import manager


async def run_pipeline(email_id: int, run_id: int, db_factory):
    """Execute the full pipeline for an email. Runs as a background task."""
    db: Session = db_factory()
    try:
        email = db.query(Email).filter(Email.id == email_id).first()
        if not email:
            return

        def get_run():
            return db.query(PipelineRun).filter(PipelineRun.id == run_id).first()

        async def log(level, msg):
            ts = datetime.now(timezone.utc).strftime("%H:%M:%S")
            run_obj = get_run()
            entry = f"[{ts}] [{level}] {msg}\n"
            run_obj.logs = (run_obj.logs or "") + entry
            db.commit()
            await manager.send_log(run_id, level, msg)

        await log("INFO", f"Pipeline started for email #{email_id}: {email.subject}")
        await log("INFO", "Agent 1 (Mistral) — parsing email and PDF attachment...")

        try:
            email_data = {
                "subject": email.subject,
                "sender": email.sender,
                "recipient": email.recipient,
                "received_date": email.received_date.isoformat() if email.received_date else "",
                "body_preview": email.body_preview or "",
                "pdf_filename": email.pdf_filename or "",
            }
            agent1_result = await agent_service.run_agent1(email_data)
            agent1_json = json.dumps(agent1_result, indent=2)
            await log("INFO", "Agent 1 completed successfully")
            await log("INFO", f"Classification: {agent1_result.get('classification', 'unknown')}")
            await log("INFO", f"OCR Confidence: {agent1_result.get('pdf_extracted', {}).get('ocr_confidence', 'N/A')}")
        except Exception as e:
            await log("ERROR", f"Agent 1 failed: {e}")
            run_obj = get_run()
            run_obj.status = "failed"
            run_obj.error_message = str(e)
            run_obj.completed_at = datetime.now(timezone.utc)
            email.status = "error"
            db.commit()
            await manager.broadcast_event({"type": "pipeline_complete", "run_id": run_id, "email_id": email_id, "status": "failed"})
            return

        await log("INFO", "Agent 2 — generating Excel export...")
        try:
            agent2_result = await agent_service.run_agent2(agent1_result)
            export_filename = generate_excel(agent1_json, email_id, run_id)
            await log("INFO", f"Agent 2 completed — export: {export_filename}")
        except Exception as e:
            await log("ERROR", f"Agent 2 failed: {e}")
            run_obj = get_run()
            run_obj.status = "failed"
            run_obj.error_message = str(e)
            run_obj.completed_at = datetime.now(timezone.utc)
            run_obj.agent1_output = agent1_json
            email.status = "error"
            db.commit()
            await manager.broadcast_event({"type": "pipeline_complete", "run_id": run_id, "email_id": email_id, "status": "failed"})
            return

        run_obj = get_run()
        run_obj.status = "success"
        run_obj.agent1_output = agent1_json
        run_obj.agent2_output_path = export_filename
        run_obj.completed_at = datetime.now(timezone.utc)
        email.status = "completed"
        email.updated_at = datetime.now(timezone.utc)
        db.commit()

        await log("INFO", "Pipeline completed successfully")
        await manager.broadcast_event({"type": "pipeline_complete", "run_id": run_id, "email_id": email_id, "status": "success"})

    except Exception as e:
        try:
            email = db.query(Email).filter(Email.id == email_id).first()
            if email:
                email.status = "error"
                db.commit()
        except Exception:
            pass
    finally:
        db.close()
