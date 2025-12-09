import asyncio
import random



KNOWLEDGE_BASE = {
    "hiring": "We are currently looking for Senior Engineers and Product Designers. Please visit our careers page.",
    "funding": "We recently closed our Series A led by TopTier VC. We are well capitalized for the next 24 months.",
    "product": "Our roadmap includes mobile apps and advanced analytics. Stay tuned for the Q4 release.",
    "vision": "Our mission is to democratize access to founder knowledge through real-time tooling.",
}

async def generate_suggestion(question_text: str) -> str:
    
    await asyncio.sleep(1.5)
    
  
    text = question_text.lower()
    
    if "hiring" in text or "job" in text or "work" in text:
        return KNOWLEDGE_BASE["hiring"]
    elif "money" in text or "fund" in text or "invest" in text:
        return KNOWLEDGE_BASE["funding"]
    elif "roadmap" in text or "feature" in text or "build" in text:
        return KNOWLEDGE_BASE["product"]
    
   
    return "That's a great question. We appreciate your interest and will get back to you with a detailed update shortly."