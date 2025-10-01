# Aegis Task Manager

A polished full-stack task management platform that showcases secure authentication, collaborative task workflows, and a modern React interface. Built to demonstrate production-ready engineering practices during interviews and portfolio reviews.

🌐 **[Live Demo](https://ageis.vercel.app)** | 🔗 **[Backend API](https://ageis.onrender.com/api/health)**

## Table of Contents
- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture at a Glance](#architecture-at-a-glance)
- [Key Features](#key-features)
- [Getting Started](#getting-started)
- [API Snapshot](#api-snapshot)
- [What Makes It Stand Out](#what-makes-it-stand-out)
- [Additional Resources](#additional-resources)

## Overview
Aegis streamlines personal and team productivity with a lightweight yet secure task tracker. Users can sign up, manage their profile, and create, update, or archive tasks from an elegant dashboard. The project demonstrates end-to-end engineering: a reactive TypeScript UI, a hardened Node.js API, and persistent storage on MongoDB Atlas.

## Tech Stack
| Layer | Technologies |
| --- | --- |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Radix UI, TanStack Query, React Router |
| Backend | Node.js, Express, Mongoose, MongoDB Atlas, JWT, bcrypt, express-validator |
| Tooling & DX | ESLint, SWC, Vite proxy, Nodemon, PowerShell setup scripts |

## Architecture at a Glance
- **Client (src/):** SPA powered by React + TypeScript with atomic UI components and protected routes.
- **API (backend/src/):** Layered Express app with controllers, services, middleware, and reusable response helpers.
- **Database:** MongoDB collections for users and tasks accessed through Mongoose models and schema validation.
- **Security:** JWT authentication, password hashing, input validation, rate limiting, CORS hardening, and centralized error handling.
- **Communication:** Vite dev server proxies `/api` traffic to the Express backend for seamless local development.

## Key Features
- 🔐 **Account Management:** Signup/login flows with password strength enforcement, confirm-password checks, and profile updates.
- ✅ **Task Lifecycle:** Create, filter, update, and delete tasks with ownership enforcement and pagination-ready responses.
- 📊 **Dashboard UX:** Responsive layout, sidebar navigation, toast feedback, and keyboard-friendly forms.
- 🛡️ **Stability:** Structured validation, consistent API responses, and graceful server shutdown handling.
- ⚙️ **Developer Ready:** Clear folder structure, environment templates, and automated setup via PowerShell script.

## Getting Started
1. **Install dependencies**
   ```powershell
   npm install
   cd backend
   npm install
   ```

2. **Configure environment**
   ```powershell
   cd backend
   copy .env.example .env  # Update MongoDB URI, JWT secret, and FRONTEND_URL
   ```

3. **Run the stack locally** (use two terminals)
   ```powershell
   # Terminal 1 - backend
   cd backend
   npm start

   # Terminal 2 - frontend
   npm run dev
   ```

4. **Access the app**
   - Frontend: http://localhost:8081 (Vite dev server)
   - API base: http://localhost:5000/api

## API Snapshot
| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/signup` | Register a new account |
| POST | `/api/login` | Authenticate via email or username |
| GET | `/api/profile` | Fetch current user (JWT required) |
| PUT | `/api/profile` | Update profile or password |
| GET | `/api/tasks` | List tasks for the authenticated user |
| POST | `/api/tasks` | Create a new task |
| GET | `/api/tasks/:id` | Retrieve task details |
| PUT | `/api/tasks/:id` | Edit a task |
| DELETE | `/api/tasks/:id` | Remove a task |

> Full request/response schemas and backend deep dive live in [`backend/README.md`](backend/README.md).

## What Makes It Stand Out
- **Production-ready narrative:** Clean architecture, thoughtful security choices, and clear documentation you can walk through live.
- **Modern product feel:** UI polish, toast notifications, loading states, and responsive layouts mimic production quality.
- **Scalable foundations:** Organized modules, environment-driven config, and MongoDB Atlas integration pave the way for real deployments.
- **Demonstrated craftsmanship:** Comprehensive validation, reusable utilities, and consistent TypeScript usage front-to-back.

## Additional Resources
- `setup.ps1`: One-command bootstrap for Windows environments.
- `.env.example`: Reference for mandatory configuration variables.
- [`backend/README.md`](backend/README.md): Expanded backend architecture, models, and API reference.
