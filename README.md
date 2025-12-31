# Internal Task Manager — Frontend (React + Vite)

## Overview
This is the **frontend web app** for the Internal Task Manager system.

- **Manager (Admin)** dashboard: manage team tasks (CRUD, filters, pagination)
- **Member** page: view assigned tasks and update status

---

## Tech Stack
- React + Vite
- Tailwind CSS
- React Router
- Axios

---

## Project Structure (Typical)
```txt
frontend/
├─ src/
│  ├─ pages/
│  │  ├─ Login.jsx
│  │  ├─ AdminDashboard.jsx
│  │  └─ MyTasks.jsx
│  ├─ components/
│  ├─ auth/
│  ├─ api/
│  └─ utils/
├─ public/
├─ index.html
├─ vite.config.js
├─ package.json
└─ .gitignore
```

---

## Requirements
- Node.js **v18+** recommended
- npm

---

## Setup (Local)

### 1) Install

cd frontend
npm install


### 2) Create `.env` in `frontend/`

VITE_API_URL=http://localhost:5000


### 3) Run dev server

npm run dev

Open:
- http://localhost:5173

---

## Environment Variables

### `VITE_API_URL`
This is your backend base URL.

Local:
```env
VITE_API_URL=http://localhost:5000
```

Production (Vercel):
```env
VITE_API_URL=https://task-manager-banckend.vercel.app
```

---

## Routing (Typical)
- `/login` → login page
- `/admin` → manager dashboard (protected, admin only)
- `/my-tasks` → member tasks page (protected)
- `/` → redirects based on role

---

## Deployment (Vercel)
1. Push `frontend/` to GitHub (separate repo or monorepo)
2. Vercel → **New Project** → import repo
3. Add environment variable in Vercel:
   - `VITE_API_URL` = `https://YOUR_BACKEND.vercel.app`
4. Deploy

---

## Common Troubleshooting

### 1) Login 500 / API failed
- Check `VITE_API_URL` is correct
- Open backend health URL:
  - `https://YOUR_BACKEND.vercel.app/api/health`

### 2) CORS blocked
If you see CORS error in browser console:
- Add your **frontend Vercel domain** into backend `CORS_ORIGINS`
- Redeploy backend

### 3) Wrong API base URL locally
Make sure `.env` exists in frontend root and restart dev server.

---

## Assignment Proof

- Login screen (mobile + desktop)

<img width="1731" height="800" alt="image" src="https://github.com/user-attachments/assets/25236cca-e9eb-475b-ba7e-9a9e62f2d319" />

<img width="563" height="1317" alt="image" src="https://github.com/user-attachments/assets/ba4a452e-2fe2-40d9-bc51-49470b10bac7" />

- Admin dashboard (filters + pagination)

<img width="1731" height="1630" alt="image" src="https://github.com/user-attachments/assets/db5179e4-ca94-4d16-a76f-6b5960c54fd0" />

<img width="563" height="4613" alt="image" src="https://github.com/user-attachments/assets/78df02d0-5341-4884-a5bc-0fa02bc86759" />

- Member tasks page

<img width="1731" height="1159" alt="image" src="https://github.com/user-attachments/assets/5b527ab3-f07f-4218-9e34-3cc7e54a052d" />

<img width="563" height="3009" alt="image" src="https://github.com/user-attachments/assets/cc012af6-2d90-4a0f-b551-69652ca553f3" />

- Vercel deployment URLs
 https://task-manager-sand-three.vercel.app/login (Frontend)
 https://task-manager-banckend.vercel.app/ (Backend)

