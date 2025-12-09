from pydantic import BaseModel, Field
from datetime import datetime
from typing import List


class ReplyBase(BaseModel):
    content: str

class ReplyCreate(ReplyBase):
    pass

class Reply(ReplyBase):
    id: int
    question_id: int
    created_at: datetime
    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    username: str
    password: str = Field(..., min_length=6, max_length=12)

class Token(BaseModel):
    access_token: str
    token_type: str


class QuestionBase(BaseModel):
    content: str

class QuestionCreate(QuestionBase):
    pass

class Question(QuestionBase):
    id: int
    status: str
    created_at: datetime
    votes: int = 0 
    replies: List[Reply] = []
    
    class Config:
        from_attributes = True