# CampusAI

An AI-powered, multi-agent platform for schools. Every school gets its own branded AI assistant with role-based agents for students, teachers, principals, office staff, and parents.

---

## Project Structure

```
campusai/
├── backend/        Django — auth, school management, user management
├── ai_engine/      FastAPI — AI agent routing and chat endpoints
└── frontend/       Next.js — white-labeled chat UI (coming soon)
```

---

## Prerequisites

- Python 3.12+
- [`uv`](https://docs.astral.sh/uv/) — Python package manager
- Node.js 18+ (for frontend, later)

---

## Backend (Django)

### 1. Install dependencies

```bash
cd backend
uv sync
```

### 2. Set up environment variables

```bash
cp .env.example .env
# Edit .env and fill in your values
```

### 3. Run migrations

```bash
uv run python manage.py migrate
```

### 4. Create a superuser (company admin)

```bash
uv run python manage.py createsuperuser
```

### 5. Start the server

```bash
uv run python manage.py runserver
```

Backend runs at: `http://localhost:8000`

Django Admin panel: `http://localhost:8000/admin/`

---

## AI Engine (FastAPI)

### 1. Install dependencies

```bash
cd ai_engine
uv sync
```

### 2. Set up environment variables

```bash
cp .env.example .env
# Add your GOOGLE_API_KEY
```

### 3. Start the server

```bash
uv run uvicorn main:app --reload --port 8001
```

AI Engine runs at: `http://localhost:8001`

API docs (auto-generated): `http://localhost:8001/docs`

---

## API Overview

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login/` | Login — returns JWT access + refresh tokens |
| POST | `/api/auth/refresh/` | Refresh access token |

### Schools (admin only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/schools/` | List all schools |
| POST | `/api/schools/` | Create a new school |
| GET | `/api/schools/{id}/` | Get school details |
| PUT | `/api/schools/{id}/` | Update school |

### Users (admin only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/` | List users in your school |
| POST | `/api/users/` | Add a new user |

### Chat (AI Engine)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/chat` | Send a message to the agent |

Chat request body:
```json
{
  "school_id": 1,
  "user_id": 42,
  "role": "student",
  "message": "Explain the summary of The Portrait of a Lady"
}
```

---

## User Roles

| Role | Description |
|------|-------------|
| `student` | Routed to Student Agent — Q&A from school's textbooks |
| `teacher` | Routed to Teacher Agent — lesson plans, worksheets |
| `principal` | Routed to Principal Agent — circulars, speeches |
| `office` | Routed to Office Agent — certificates, notices |
| `parent` | Routed to Parent Agent — child guidance, communication |

---

## Branch Strategy

```
main      production-ready snapshots only
dev       active development — merge features here
feature/* day-to-day work branches
```

Always branch off `dev`:
```bash
git checkout dev
git checkout -b feature/your-feature-name
```

Merge back to `dev` when done. Only `dev → main` when a full phase is complete.

---

## Onboarding a New School

1. Log in to Django Admin at `/admin/`
2. Create a **School** record (name, slug, AI name, branding colors)
3. Create a **User** record for the school admin (role: `principal`)
4. Share login credentials with the school
5. School admin logs in and adds their own teachers/students

---

## Roadmap

- [x] Phase 1 — Django backend: School + User models, JWT auth
- [x] Phase 1 — FastAPI AI engine: `/chat` endpoint skeleton
- [ ] Phase 2 — All 5 role-based agents wired in
- [ ] Phase 2 — Per-school RAG (document upload + vectorstore)
- [ ] Phase 2 — Chat history saved to DB
- [ ] Phase 3 — Next.js frontend with white-labeling
- [ ] Phase 3 — School subdomain routing
- [ ] Phase 3 — PDF generation (lesson plans, worksheets)
