import asyncio
from sentence_transformers import SentenceTransformer
import chromadb
import uuid
import numpy as np
model = SentenceTransformer("all-MiniLM-L6-v2")

client = chromadb.Client()

collection = client.get_or_create_collection(name="founder_qa")

KNOWLEDGE_BASE = [
    "We are currently looking for Senior Engineers and Product Designers. Please visit our careers page.",
     "We recently closed our Series A led by TopTier VC. We are well capitalized for the next 24 months.",
     "Our roadmap includes mobile apps and advanced analytics. Stay tuned for the Q4 release.",
     "Our mission is to democratize access to founder knowledge through real-time tooling.",
]


def get_embeddings(text: str):
    embeddings = np.array(model.encode(text)).tolist()

    

    return embeddings

def init_db():

    if collection.count() > 0:
        return
    ids = []
    embeddings = []
    for i in range(len(KNOWLEDGE_BASE)):
        unique_id= str(uuid.uuid4())
        ids.append(unique_id)
        current_embeddings = get_embeddings(KNOWLEDGE_BASE[i])
        embeddings.append(current_embeddings)
    
    collection.add(ids=ids, documents=KNOWLEDGE_BASE, embeddings=embeddings)
    print("🧠 AI AGENT: Ingestion Complete.")


async def generate_suggestion(question_text: str) -> str:
    
    await asyncio.sleep(1.0)
    
  
    user_embedding =  get_embeddings(question_text)
    results =  collection.query(query_embeddings=[user_embedding], n_results=1)
    if results:
        best_answer = results['documents'][0][0]
        score = results['distances'][0][0]
        if score < 1.2:
            return best_answer
    
    return "That's a great question. We appreciate your interest and will get back to you with a detailed update shortly."