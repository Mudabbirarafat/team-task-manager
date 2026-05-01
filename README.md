# ◈ TaskFlow — Team Task Manager

A full-stack task management application built with Node.js, Express, MongoDB, and React. Both frontend and backend are deployed on Railway.

---

## 🔗 Live URLs

| Service | URL |
|---------|-----|
| Frontend | https://exciting-courage-production-7788.up.railway.app |
| Backend API | https://team-task-manager-production-2bb8.up.railway.app |

---

## Project Structure

```
team-task-manager/
├── backend/
│   ├── config/         # DB connection
│   ├── controllers/    # Route handlers
│   ├── middleware/     # JWT auth + role guards
│   ├── models/         # Mongoose schemas
│   ├── routes/         # Express routers
│   ├── server.js       # App entry point
│   ├── .env.example    # Environment template
│   └── railway.json    # Railway deployment config
└── frontend/
    ├── public/
    ├── src/
    │   ├── api/        # Axios instance
    │   ├── components/ # Layout, shared UI
    │   ├── context/    # Auth context
    │   ├── pages/      # Login, Signup, Dashboard, Projects, Tasks
    │   └── utils/      # Helper functions
    └── .env.example
```

---

## Running Locally

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### 1. Clone and install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure environment variables

**Backend** — copy `.env.example` to `.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/teamtaskmanager
JWT_SECRET=your_super_secret_key_min_32_chars
JWT_EXPIRES_IN=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

**Frontend** — copy `.env.example` to `.env`:
```env
REACT_APP_API_URL=http://localhost:5000
```

### 3. Run development servers

```bash
# Terminal 1 — Backend
cd backend
npm run dev
# Server starts at http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm start
# App opens at http://localhost:3000
```

---

## API Endpoints

### Auth
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/auth/signup` | Public | Register new user |
| POST | `/auth/login` | Public | Login & get JWT |
| GET | `/auth/me` | Private | Get current user |

### Projects
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/projects` | Admin | Create project |
| GET | `/projects` | Any | List projects |
| GET | `/projects/:id` | Member/Admin | Get project details |
| POST | `/projects/:id/members` | Admin | Add member to project |
| GET | `/projects/users` | Admin | List all users |

### Tasks
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/tasks` | Admin | Create task |
| GET | `/tasks` | Any | List tasks |
| PUT | `/tasks/:id` | Any* | Update task |
| DELETE | `/tasks/:id` | Admin | Delete task |

> *Members can only update status of their own tasks

### Dashboard
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/dashboard` | Any | Get stats summary |

---

## Deployment on Railway

Both frontend and backend are deployed as separate services on the same Railway project.

### Backend Service (team-task-manager)

**Settings:**
- Root Directory: `backend`
- Start Command: `node server.js`

**Environment Variables:**
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/taskmanager
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
NODE_ENV=production
FRONTEND_URL=https://exciting-courage-production-7788.up.railway.app
```

### Frontend Service (exciting-courage)

**Settings:**
- Root Directory: `frontend`
- Build Command: `npm run build`
- Start Command: `npm install -g serve && serve -s build -l 3000`

**Environment Variables:**
```env
PORT=3000
REACT_APP_API_URL=https://team-task-manager-production-2bb8.up.railway.app
```

### Deployment Steps

1. Push code to GitHub
2. Go to [railway.app](https://railway.app) → Login with GitHub
3. New Project → Deploy from GitHub repo
4. Add backend service → set Root Directory to `backend` → add variables → Generate Domain
5. Add frontend service → set Root Directory to `frontend` → add variables → Generate Domain
6. Update backend `FRONTEND_URL` with frontend Railway domain
7. Update frontend `REACT_APP_API_URL` with backend Railway domain
8. Build frontend locally: `cd frontend && npm run build`
9. Push build folder to GitHub (remove `build/` from `.gitignore`)
10. Railway auto-redeploys

---

## Roles & Permissions

| Feature | Admin | Member |
|---------|-------|--------|
| Create projects | ✅ | ❌ |
| View own projects | ✅ | — |
| View assigned projects | — | ✅ |
| Add members to project | ✅ | ❌ |
| Create tasks | ✅ | ❌ |
| View all project tasks | ✅ | ❌ |
| View own tasks | ✅ | ✅ |
| Update any task | ✅ | ❌ |
| Update own task status | — | ✅ |
| Delete tasks | ✅ | ❌ |

---

## Tech Stack

- **Backend**: Node.js, Express, Mongoose, JWT, bcryptjs
- **Frontend**: React 18, React Router v6, Axios
- **Database**: MongoDB Atlas
- **Deployment**: Railway (both frontend and backend)