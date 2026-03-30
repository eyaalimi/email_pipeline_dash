"""
Mock Agent Service — clean abstraction layer.
Replace the mock implementations with real API calls when agents are ready.
"""
import asyncio
import random
import json
from datetime import datetime


class AgentService:
    """Interface for AI pipeline agents. Swap implementations by changing this class."""

    async def run_agent1(self, email_data: dict) -> dict:
        """
        Agent 1 (Mistral): Parse email + PDF attachment.
        Returns normalized JSON with extracted fields.
        """
        return await self._mock_agent1(email_data)

    async def run_agent2(self, agent1_output: dict) -> str:
        """
        Agent 2: Generate Excel/CSV from parsed JSON.
        Returns path to generated file (relative to exports dir).
        """
        return await self._mock_agent2(agent1_output)

    # --- Mock implementations below — replace with real API calls ---

    async def _mock_agent1(self, email_data: dict) -> dict:
        await asyncio.sleep(random.uniform(2, 4))

        if random.random() < 0.10:
            raise Exception("Agent 1 failed: Mistral model timeout — could not parse PDF content")

        return {
            "email_metadata": {
                "subject": email_data.get("subject", ""),
                "from": email_data.get("sender", ""),
                "to": email_data.get("recipient", ""),
                "date": email_data.get("received_date", ""),
            },
            "body_text": email_data.get("body_preview", "") + " [Full body extracted by Agent 1]",
            "pdf_extracted": {
                "title": f"Invoice / Document — {email_data.get('pdf_filename', 'document.pdf')}",
                "pages": random.randint(1, 12),
                "content_blocks": [
                    {"type": "header", "text": "Dräxlmaier Group — Internal Document"},
                    {"type": "table", "headers": ["Part Number", "Description", "Quantity", "Unit Price"],
                     "rows": [
                         ["DRX-" + str(random.randint(10000, 99999)), "Wiring Harness Assembly", str(random.randint(10, 500)), f"{random.uniform(15, 200):.2f} EUR"],
                         ["DRX-" + str(random.randint(10000, 99999)), "Connector Housing", str(random.randint(50, 1000)), f"{random.uniform(2, 50):.2f} EUR"],
                         ["DRX-" + str(random.randint(10000, 99999)), "Cable Protection Tube", str(random.randint(100, 2000)), f"{random.uniform(1, 25):.2f} EUR"],
                     ]},
                    {"type": "paragraph", "text": "Delivery expected within 14 business days. Payment terms: Net 30."},
                ],
                "ocr_confidence": round(random.uniform(0.85, 0.99), 2),
            },
            "classification": random.choice(["invoice", "purchase_order", "delivery_note", "quality_report"]),
            "language": random.choice(["de", "en"]),
            "processed_at": datetime.utcnow().isoformat(),
        }

    async def _mock_agent2(self, agent1_output: dict) -> dict:
        await asyncio.sleep(random.uniform(1, 2))

        if random.random() < 0.05:
            raise Exception("Agent 2 failed: Excel generation error — invalid data format")

        return agent1_output


agent_service = AgentService()
