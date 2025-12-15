from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, HTTPException
from sqlalchemy.orm import Session
from typing import List
from fastapi.encoders import jsonable_encoder
from app.services.ai_agent import generate_suggestion
import json
from app.core.database import get_db
from app.models import models
from app.schemas import schemas
from app.services.socket_manager import manager
from app.api.endpoints.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[schemas.Question])
def read_questions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    
    return db.query(models.Question).order_by(models.Question.created_at.desc()).offset(skip).limit(limit).all()

@router.post("/", response_model=schemas.Question)
async def create_question(question: schemas.QuestionCreate, db: Session = Depends(get_db)):
    db_question = models.Question(content=question.content)
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    
   
    full_data = jsonable_encoder(db_question)
    
    await manager.broadcast({
        "type": "NEW_QUESTION",
        "data": full_data
    })
    return db_question

@router.post("/{question_id}/reply", response_model=schemas.Reply)
async def create_reply(
    question_id: int, 
    reply: schemas.ReplyCreate, 
    db: Session = Depends(get_db)
):
    question = db.query(models.Question).filter(models.Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
        
    db_reply = models.Reply(content=reply.content, question_id=question_id)
    db.add(db_reply)
    db.commit()
    db.refresh(db_reply)
    
   
   
    db.refresh(question)
    
    
    pydantic_question = schemas.Question.model_validate(question)
    
   
    serialized_data = jsonable_encoder(pydantic_question)
    
    print(f"DEBUG: Broadcasting update with {len(serialized_data['replies'])} replies")

    await manager.broadcast({
        "type": "UPDATE_QUESTION",
        "data": serialized_data
    })
    
    return db_reply
@router.put("/{question_id}/answer")
async def answer_question(
    question_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")

    q = db.query(models.Question).filter(models.Question.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    
    q.status = "Answered"
    db.commit()
    db.refresh(q) 
    
    await manager.broadcast({
        "type": "UPDATE_QUESTION",
        "data": jsonable_encoder(q)
    })
    return {"status": "ok"}

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    print("DEBUG: WebSocket connection request received...") 
    try:
        await manager.connect(websocket)
        print("DEBUG: WebSocket connection ACCEPTED.")
        try:
            while True:
                data = await websocket.receive_text()
                json_data = json.loads(data)
                if json_data["type"] == "TYPING_EVENT":
                    await manager.broadcast({           
        "type": "TYPING_EVENT",
        "data": jsonable_encoder(data)
                    })
                print(f"DEBUG: Received data from client: {data}")
        except WebSocketDisconnect:
            print("DEBUG: Client disconnected normally.")
            manager.disconnect(websocket)
        except Exception as e:
            print(f"DEBUG: Error inside loop: {e}")
            manager.disconnect(websocket)
    except Exception as e:
        print(f"DEBUG: Failed to connect: {e}")

@router.put("/{question_id}/escalate")
async def escalate_question(
    question_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")

    q = db.query(models.Question).filter(models.Question.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    
    q.status = "Escalated"
    db.commit()
    db.refresh(q)
    
   
    await manager.broadcast({
        "type": "UPDATE_QUESTION",
        "data": jsonable_encoder(q)
    })
    return {"status": "ok"}

@router.post("/{question_id}/upvote")
async def upvote_question(question_id: int, db: Session = Depends(get_db)):
    q = db.query(models.Question).filter(models.Question.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    
    q.votes += 1
    db.commit()
    db.refresh(q)
    
  
    await manager.broadcast({
        "type": "UPDATE_QUESTION",
        "data": jsonable_encoder(q)
    })
    return {"votes": q.votes}


@router.get("/{question_id}/suggest")
async def suggest_answer(
    question_id: int, 
    db: Session = Depends(get_db),
    
    current_user: models.User = Depends(get_current_user) 
):
    q = db.query(models.Question).filter(models.Question.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
        
    suggestion = await generate_suggestion(q.content)
    return {"suggestion": suggestion}