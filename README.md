# Founder Q&A Dashboard

A real-time, full-stack Q&A platform built for the Founding Engineer technical assessment.

This application features a **FastAPI** backend and **Next.js** frontend, synchronized via **WebSockets** for instant updates. It supports Admin moderation, guest interactions, and robust error handling.

## 🚀 Key Features

- **Real-Time Architecture:** Zero-latency updates for questions, replies, and status changes using WebSockets.
- **Self-Healing Connections:** Custom WebSocket hook that automatically reconnects if the server restarts or network drops.
- **Role-Based Access Control:** \* **Admins:** Secure Login (JWT), Mark as Answered, Escalate questions.
  - **Guests:** View feed, Post questions, Reply to threads.
- **Legacy Constraint Handling:** Implemented `XMLHttpRequest` for form validation as specifically requested, wrapped in a modern Promise-based utility.
- **Modern UI:** Dark-themed, responsive dashboard built with Tailwind CSS.

## 🛠 Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS.
- **Backend:** FastAPI, Python 3.10+, Uvicorn.
- **Database:** SQLite (SQLAlchemy ORM) - _Chosen for portability and zero-config setup during review._
- **Auth:** OAuth2 with Password Flow (Bcrypt hashing + JWT tokens).
- **Protocol:** WebSockets for broadcasting events.

---

## ⚡️ Quick Start

### 1. Backend Setup

The backend uses **SQLite**, so no external database installation is required.

```bash
cd backend
python -m venv venv

# Activate Virtual Env
# Mac/Linux: source venv/bin/activate
# Windows:   venv\Scripts\activate

pip install -r requirements.txt

# Start Server (Runs on port 8000)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
