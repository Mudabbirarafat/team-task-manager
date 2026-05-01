# ◈ TaskFlow — Team Task Manager

A full-stack task management application built with Node.js, Express, MongoDB, and React.

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
    ├── vercel.json     # Vercel deployment config
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

## Deploying to Railway (Backend)

1. Push your code to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Select your repository and the `backend` folder (or use a monorepo setup)
4. Add environment variables in Railway dashboard:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN=7d`
   - `NODE_ENV=production`
   - `FRONTEND_URL=https://your-vercel-app.vercel.app`
5. Railway auto-detects Node.js and runs `npm start`
6. Copy your Railway app URL (e.g. `https://taskflow-api.up.railway.app`)

---

## Deploying to Vercel (Frontend)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
3. Set **Root Directory** to `frontend`
4. Add environment variable:
   - `REACT_APP_API_URL=https://your-railway-app.up.railway.app`
5. Click Deploy
6. Your app will be live at `https://your-app.vercel.app`

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
- **Deployment**: Railway (backend), Vercel (frontend)
