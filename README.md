# CampusAI

CampusAI is a school-focused platform with a Django API, a FastAPI AI service, and a Next.js web app.

## Project layout

```text
backend/       Django API, authentication, schools and users
ai_engine/     FastAPI chat service and student RAG agent
frontend/      Next.js web application
docker-compose.yml
```

## Quick setup on a new laptop (Docker)

Docker is the simplest way to run all three services. Install [Git](https://git-scm.com/), [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine with the Compose plugin), then clone the repository. Use the `dev` branch for the latest development code:

```bash
git clone --branch dev https://github.com/Rayyan934/campusAI.git
cd campusAI
```

Create local environment files from the examples:

```bash
cp backend/.env.example backend/.env
cp ai_engine/.env.example ai_engine/.env
cp frontend/.env.example frontend/.env.local
```

Open `ai_engine/.env` and set `GOOGLE_API_KEY` to a [Google AI Studio API key](https://aistudio.google.com/apikey) to use AI chat. The backend and frontend work locally with the example values. The email settings in `backend/.env` are only needed to send OTP emails; configure a Resend API key and verified sender if you want that feature to deliver email.

Build and start the services:

```bash
docker compose up --build -d
```

Apply Django database migrations and create your own admin login:

```bash
docker compose exec backend uv run python manage.py migrate
docker compose exec backend uv run python manage.py createsuperuser
```

Open the services:

- Web app: <http://localhost:3000>
- Django API and admin: <http://localhost:8000> and <http://localhost:8000/admin/>
- AI Engine API docs: <http://localhost:8001/docs>
- AI Engine health check: <http://localhost:8001/health>

Stop the services with `docker compose down`. To start them again later, use `docker compose up -d` from the project directory. Your source files and local environment files stay on your laptop; Django's SQLite database is at `backend/db.sqlite3`.

## Local setup without Docker

Install Python 3.12 or later, [`uv`](https://docs.astral.sh/uv/getting-started/installation/), and Node.js 20 or later. From the project root, create the same three environment files using the `cp` commands above, then set the AI key if you want to use chat. Open three terminal windows, each starting in the project root.

**Terminal 1 — Django backend**

```bash
cd backend
uv sync --frozen
uv run python manage.py migrate
uv run python manage.py createsuperuser  # one time; create your own login
uv run python manage.py runserver
```

**Terminal 2 — AI Engine**

```bash
cd ai_engine
uv sync --frozen
uv run uvicorn main:app --reload --port 8001
```

**Terminal 3 — frontend**

```bash
cd frontend
npm ci
npm run dev
```

The frontend expects the backend at `http://localhost:8000` and AI Engine at `http://localhost:8001`; those defaults are in `frontend/.env.local`. Restart the frontend after changing its environment file.

## Troubleshooting

- **The browser shows an empty or unavailable service:** confirm Docker is running and all three services started with `docker compose ps`; see service logs with `docker compose logs -f backend`, `docker compose logs -f ai_engine`, or `docker compose logs -f frontend`.
- **Admin or API reports missing database tables:** run `docker compose exec backend uv run python manage.py migrate` (Docker), or `cd backend && uv run python manage.py migrate` (local).
- **AI chat returns an error or no agent/documents:** set a valid `GOOGLE_API_KEY` in `ai_engine/.env`, restart the service, and confirm the requested school's documents exist under `ai_engine/data/<school_id>/`.
- **A port is already in use:** stop the other process using port 3000, 8000, or 8001, or adjust the port mapping in `docker-compose.yml`.

## API overview

### Authentication and school management (Django)

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/auth/login/` | Obtain JWT access and refresh tokens |
| `POST` | `/api/auth/refresh/` | Refresh an access token |
| `GET`, `POST` | `/api/schools/` | List or create schools (admin access) |
| `GET`, `PUT` | `/api/schools/{id}/` | View or update a school |
| `GET`, `POST` | `/api/users/` | List or add users (admin access) |

### Chat (AI Engine)

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/health` | Health check |
| `POST` | `/chat` | Send a message to a role agent |

Example request body:

```json
{
  "school_id": 1,
  "user_id": 42,
  "role": "student",
  "message": "Explain the summary of The Portrait of a Lady"
}
```

The current AI Engine has a student agent. It needs school documents in `ai_engine/data/<school_id>/` and a Google API key; other roles are not yet implemented in the AI Engine.

## User roles

| Role | Intended use |
| --- | --- |
| `student` | Textbook question answering |
| `teacher` | Lesson plans and worksheets |
| `principal` | Circulars and speeches |
| `office` | Certificates and notices |
| `parent` | Child guidance and communication |

## Development workflow

The `dev` branch is for active work; `main` is for release snapshots. Start work from an updated `dev` branch:

```bash
git switch dev
git pull origin dev
git switch -c feature/your-feature-name
```

Commit your changes and push the feature branch when ready:

```bash
git add .
git commit -m "Describe your change"
git push -u origin feature/your-feature-name
```

Merge completed features into `dev` through your team's usual review process. To bring a commit from another laptop, first push its branch from the original laptop, then run `git switch <branch>` and `git pull` on the other laptop.
