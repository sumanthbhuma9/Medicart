# Medicart Fullstack Application

A modern fullstack pharmacy and medical e-commerce application built with React, Vite, Express, and MongoDB.

---

## 🚀 How to Run Frontend & Backend

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Both Frontend and Backend Concurrently (Recommended)
```bash
npm run dev
```
- **Frontend (Vite)** runs at: `http://localhost:5173`
- **Backend (Express)** runs at: `http://localhost:5001`
- Requests to `/api/*` are automatically proxied from Vite to Express.

---

## 🛠️ Individual Commands

| Command | Description |
| :--- | :--- |
| `npm run dev` | Runs **both** Backend and Frontend concurrently |
| `npm run client` | Runs only the Vite Frontend (`http://localhost:5173`) |
| `npm run server` | Runs only the Express Backend (`http://localhost:5001`) |
| `npm run server:dev` | Runs the Express Backend with automatic reload (`--watch`) |
| `npm run build` | Builds production frontend bundle into `/dist` |

---

## 🔑 Demo Login Accounts

| Role | Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@sai.com` | `admin123` |
| **Customer** | `customer@sai.com` | `customer123` |
| **Customer** | `vijay@sai.com` | `vijay123` |
| **Customer** | `deepa@sai.com` | `deepa123` |

You can also register any new user account via the **Sign Up** tab.

---

## ⚙️ Configuration & Ports

- **Port 5001** is configured for the Express backend to prevent conflicts with macOS AirPlay Receiver (`AirTunes`), which occupies port 5000.
- Environment variables are located in `.env` and `server/.env`.
- If MongoDB Atlas is unavailable or your IP is not whitelisted, the backend operates in resilient in-memory mode so all product browsing, search, login, ordering, and AI symptom analysis work without crashing.
