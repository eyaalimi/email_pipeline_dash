"""Populate the database with realistic sample data for demo purposes."""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

import json
import random
from datetime import datetime, timedelta, timezone
from database import engine, SessionLocal, Base
from models import Email, PipelineRun

Base.metadata.create_all(bind=engine)

SAMPLE_EMAILS = [
    ("Invoice #INV-2024-0847 — Wiring Harness Delivery", "supplier.logistics@continental.com", "procurement@draexlmaier.com", "Please find attached the invoice for the latest wiring harness shipment. Total: 42,500 EUR. Payment due within 30 days."),
    ("PO Confirmation — BMW iX Cable Assembly", "orders@bmw-group.com", "sales@draexlmaier.com", "We confirm receipt of your purchase order #PO-2024-1122 for 5,000 cable assemblies. Expected delivery: Week 48."),
    ("Quality Report — Connector Housing Batch #B2847", "qa.team@draexlmaier.com", "production@draexlmaier.com", "Batch inspection complete. 2 out of 500 units failed tolerance check. Defect rate: 0.4%. Within acceptable range."),
    ("Delivery Note DN-2024-3391 — Mercedes EQS Harness", "warehouse@draexlmaier.com", "logistics@mercedes-benz.com", "Shipment dispatched via DHL Express. Tracking: DE847291034. ETA: 2 business days."),
    ("RFQ Response — Interior Lighting Module", "engineering@hella.com", "sourcing@draexlmaier.com", "Attached is our quotation for the interior ambient lighting module. Unit price: 23.80 EUR for MOQ 10,000."),
    ("ECR-2024-0192 — Updated Routing Specification", "design.eng@draexlmaier.com", "production.planning@draexlmaier.com", "Engineering change request for harness routing in door panel assembly. See attached PDF for revised 3D routing path."),
    ("Supplier Audit Schedule — Q1 2025", "compliance@draexlmaier.com", "suppliers@tier2-electronics.com", "Annual supplier audit scheduled for January 15-17, 2025. Please prepare documentation per IATF 16949 requirements."),
    ("Cost Reduction Proposal — Alternative Connector", "value.eng@draexlmaier.com", "procurement@draexlmaier.com", "Proposing switch from TE Connectivity to Aptiv connector. Estimated savings: 12% per unit. Qualification testing needed."),
    ("Prototype Request — Porsche Taycan Facelift", "prototype@porsche.com", "npi@draexlmaier.com", "Request for 20 prototype harness sets for Taycan facelift program. Drawing package attached. Deadline: December 1."),
    ("Claim Notification — Damaged Shipment #SH-9921", "claims@dhl.com", "logistics@draexlmaier.com", "Shipment SH-9921 arrived with water damage to 3 pallets. Insurance claim initiated. Photos attached."),
    ("Monthly KPI Report — November 2024", "operations@draexlmaier.com", "management@draexlmaier.com", "November production KPIs: OEE 94.2%, scrap rate 1.1%, on-time delivery 98.7%. Full report attached."),
    ("Tooling Order — Injection Mold T-2024-0056", "tooling@draexlmaier.com", "mold.shop@precision-tools.de", "Order for new injection mold for connector housing. Material: H13 steel. Lead time: 8 weeks. Budget: 65,000 EUR."),
    ("EDI Integration Test Results — VW Group", "it.systems@draexlmaier.com", "edi.support@volkswagen.de", "EDI 856 (ASN) test messages processed successfully. Ready for production go-live on December 2, 2024."),
    ("Safety Incident Report — Plant Vilsbiburg", "ehs@draexlmaier.com", "plant.management@draexlmaier.com", "Minor incident on Line 4: operator contact with hot element. First aid administered. Root cause analysis initiated."),
    ("Customs Documentation — Export to USA", "customs@draexlmaier.com", "import@draexlmaier-usa.com", "Commercial invoice and packing list for shipment to Chattanooga plant. HS code: 8544.30. USMCA certificate attached."),
    ("Training Schedule — New MES System Rollout", "hr.training@draexlmaier.com", "all-production@draexlmaier.com", "Mandatory training sessions for new Manufacturing Execution System. Schedule: Dec 9-13. Please register via portal."),
    ("Warranty Claim Analysis — Audi Q8 e-tron", "warranty@draexlmaier.com", "quality@audi.com", "Investigation of field return #FR-2024-0089 complete. Root cause: connector pin corrosion due to insufficient sealing. Corrective action plan attached."),
    ("Raw Material Price Update — Copper Q1 2025", "commodity@draexlmaier.com", "finance@draexlmaier.com", "Copper wire prices projected to increase 8% in Q1 2025. Recommend forward-buying to lock current rates. Analysis attached."),
]

STATUSES = ["pending", "pending", "pending", "completed", "completed", "completed", "completed", "completed", "error", "processing"]
PDF_NAMES = [
    "invoice_INV2024_0847.pdf", "po_confirmation_bmw.pdf", "quality_report_B2847.pdf",
    "delivery_note_DN3391.pdf", "rfq_response_hella.pdf", "ecr_routing_spec.pdf",
    "audit_schedule_q1.pdf", "cost_reduction_connector.pdf", "prototype_request_taycan.pdf",
    "claim_photos_SH9921.pdf", "kpi_report_nov2024.pdf", "tooling_order_T0056.pdf",
    "edi_test_results.pdf", "safety_incident_report.pdf", "customs_docs_usa.pdf",
    "mes_training_schedule.pdf", "warranty_analysis_q8.pdf", "copper_price_update.pdf",
]

def seed():
    db = SessionLocal()
    if db.query(Email).count() > 0:
        print("Database already has data. Clearing and re-seeding...")
        db.query(PipelineRun).delete()
        db.query(Email).delete()
        db.commit()

    base_date = datetime(2024, 11, 1, 8, 0, 0, tzinfo=timezone.utc)
    emails = []

    for i, (subject, sender, recipient, body) in enumerate(SAMPLE_EMAILS):
        status = STATUSES[i % len(STATUSES)]
        received = base_date + timedelta(days=i * 2, hours=random.randint(0, 8), minutes=random.randint(0, 59))
        email = Email(
            subject=subject,
            sender=sender,
            recipient=recipient,
            received_date=received,
            body_preview=body[:200],
            pdf_filename=PDF_NAMES[i] if i < len(PDF_NAMES) else "document.pdf",
            pdf_path=f"uploads/{PDF_NAMES[i]}" if i < len(PDF_NAMES) else "",
            status=status,
        )
        db.add(email)
        db.flush()
        emails.append((email, status))

    db.commit()

    # Create pipeline runs for completed and error emails
    for email, status in emails:
        if status in ("completed", "error"):
            started = email.received_date + timedelta(minutes=random.randint(5, 120))
            duration = random.uniform(3, 8)
            completed = started + timedelta(seconds=duration)
            run_status = "success" if status == "completed" else "failed"

            agent1_output = json.dumps({
                "email_metadata": {
                    "subject": email.subject,
                    "from": email.sender,
                    "to": email.recipient,
                    "date": email.received_date.isoformat(),
                },
                "body_text": email.body_preview,
                "pdf_extracted": {
                    "title": email.pdf_filename,
                    "pages": random.randint(1, 8),
                    "content_blocks": [
                        {"type": "header", "text": "Dräxlmaier Group — Document"},
                        {"type": "table", "headers": ["Part Number", "Description", "Qty", "Price"],
                         "rows": [
                             [f"DRX-{random.randint(10000,99999)}", "Wiring Harness Assembly", str(random.randint(10,500)), f"{random.uniform(15,200):.2f} EUR"],
                             [f"DRX-{random.randint(10000,99999)}", "Connector Housing", str(random.randint(50,1000)), f"{random.uniform(2,50):.2f} EUR"],
                         ]},
                        {"type": "paragraph", "text": "Standard terms and conditions apply."},
                    ],
                    "ocr_confidence": round(random.uniform(0.88, 0.99), 2),
                },
                "classification": random.choice(["invoice", "purchase_order", "delivery_note", "quality_report"]),
                "language": random.choice(["de", "en"]),
                "processed_at": completed.isoformat(),
            }, indent=2)

            error_msg = "Agent 1 timeout: could not parse PDF content" if run_status == "failed" else None

            run = PipelineRun(
                email_id=email.id,
                started_at=started,
                completed_at=completed,
                status=run_status,
                agent1_output=agent1_output if run_status == "success" else "",
                agent2_output_path="",
                error_message=error_msg,
                logs=f"[{started.strftime('%H:%M:%S')}] [INFO] Pipeline started\n[{completed.strftime('%H:%M:%S')}] [{'INFO' if run_status == 'success' else 'ERROR'}] Pipeline {'completed' if run_status == 'success' else 'failed'}\n",
            )
            db.add(run)

    db.commit()
    db.close()
    print(f"Seeded {len(SAMPLE_EMAILS)} emails with pipeline runs.")

if __name__ == "__main__":
    seed()
