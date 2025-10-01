# Backend Documentation – Aegis Task Manager

A purposely structured Node.js + Express API that powers authentication and task management for the Aegis platform. This guide equips you to speak confidently about the backend’s design, security posture, and extension points.

## Contents
1. [Design Goals](#design-goals)
2. [System Overview](#system-overview)
3. [Directory Structure](#directory-structure)
4. [Configuration & Environment](#configuration--environment)
5. [Data Models](#data-models)
6. [Request Lifecycle](#request-lifecycle)
7. [API Reference](#api-reference)
8. [Validation & Security](#validation--security)
9. [Error Handling & Responses](#error-handling--responses)
10. [Extensibility Ideas](#extensibility-ideas)

## Design Goals
- **Security first:** JWT auth, password hashing, and robust validation around every entry point.
- **Clarity:** Lean controller logic with helpers for responses, validation, and auth flow.
- **Interview ready:** Easy to explain architecture with clean separation of concerns.
- **Scalability:** MongoDB Atlas integration, centralized config, and rate limiting built in.

## System Overview
| Concern | Implementation |
| --- | --- |
| Runtime | Node.js 20+, Express 4 |
| Database | MongoDB Atlas (Mongoose ODM) |
| Auth | JWT with refresh-less short-lived tokens |
| Session Security | Bcrypt salted hashing, token revocation via secrets rotation |
| Validation | express-validator + reusable `validation.js` middleware |
| Observability | Structured logging via console + consistent success/error payloads |

## Directory Structure
```
backend/
├── src/
│   ├── app.js              # Express app configuration and middleware stack
│   ├── server.js           # HTTP server bootstrap & graceful shutdown
│   ├── config/
│   │   ├── constants.js    # Status codes, validation rules, error messages
│   │   └── db.js           # MongoDB connection logic with retry/backoff
│   ├── controllers/
│   │   ├── authController.js  # Signup, login, profile operations
│   │   └── taskController.js  # Task CRUD for authenticated users
│   ├── middleware/
│   │   ├── auth.js         # JWT protect/optional auth guards
│   │   ├── validation.js   # express-validator rule sets + result handler
│   │   └── errorHandler.js # Centralized error converter
│   ├── models/
│   │   ├── User.js         # User schema, password hooks, instance helpers
│   │   └── Task.js         # Task schema with search and pagination helpers
│   ├── routes/
│   │   ├── authRoutes.js   # /api/signup, /api/login, /api/profile
│   │   └── taskRoutes.js   # /api/tasks endpoints
│   └── utils/
│       ├── jwt.js          # Token generation/verification wrappers
│       └── response.js     # `sendSuccess`, `sendError`, `sendPaginatedResponse`
└── setup.ps1               # Windows bootstrap script for env + dependencies
```

## Configuration & Environment
1. Copy the template:
   ```powershell
   copy .env.example .env
   ```
2. Update the following keys:
   | Variable | Description |
   | --- | --- |
   | `PORT` | HTTP port (default 5000) |
   | `MONGODB_URI` | Connection string for MongoDB Atlas or local instance |
   | `JWT_SECRET` | 32+ character secret for signing auth tokens |
   | `JWT_EXPIRES_IN` | Token lifespan (default `7d`) |
   | `FRONTEND_URL` | Allowed origin for CORS (e.g., `http://localhost:8081`) |
   | `RATE_LIMIT_WINDOW_MS` | Rate limit window in ms (default 15 minutes) |
   | `RATE_LIMIT_MAX_REQUESTS` | Max requests per window (default 100) |

## Data Models
### User
```json
{
  "email": "user@example.com",
  "username": "taskmaster",
  "password": "<hashed>",
  "createdAt": "2025-10-01T22:15:00Z",
  "updatedAt": "2025-10-01T22:15:00Z"
}
```
- Pre-save hook salts and hashes passwords using bcrypt.
- Indexes enforce unique email and username.
- Instance methods:
  - `comparePassword(plain: string)` – verifies login attempts.
  - `toPublicJSON()` – strips sensitive fields before responses.

### Task
```json
{
  "userId": "ObjectId(User)",
  "title": "Refine onboarding flow",
  "description": "Review copy and add success metrics",
  "status": "in-progress",
  "dueDate": "2025-10-05T00:00:00Z",
  "priority": "high",
  "tags": ["ux", "milestone"],
  "createdAt": "2025-10-01T22:20:00Z",
  "updatedAt": "2025-10-02T08:10:00Z"
}
```
- Belongs to a user (`userId`).
- Supports smart filtering and text search via compound indexes.
- Helpers for paginated listings (`findByUser`, `countByUser`).

## Request Lifecycle
1. **Route Registration** – `app.js` mounts `/api` routes and global middleware.
2. **Security Middleware** – Helmet, CORS, rate limiting, and JSON parsing run first.
3. **Validation** – Route-specific validator arrays run before controllers.
4. **Authentication** – `auth.protect` ensures JWT validity and loads the current user.
5. **Controller Logic** – Lean controller functions execute core use cases.
6. **Response Helpers** – `sendSuccess` / `sendError` standardize payload contracts.
7. **Error Handling** – Any thrown error funnels into `errorHandler.js`, mapping to status codes.

## API Reference
> All responses use the shape `{ success: boolean, message?: string, data?: any, errors?: any[] }`.

### Auth
| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/signup` | Public | Register new users with password strength enforcement and confirmation |
| POST | `/api/login` | Public | Login via email or username and receive JWT |
| GET | `/api/profile` | JWT | Return the authenticated user profile |
| PUT | `/api/profile` | JWT | Update email, username, and optionally password |

**Signup Request**
```json
{
  "email": "founder@example.com",
  "username": "ae_admin",
  "password": "StrongPass!9",
  "confirmPassword": "StrongPass!9"
}
```

**Signup Response**
```json
{
  "success": true,
  "token": "<jwt>",
  "user": {
    "id": "66fdbf8732...",
    "email": "founder@example.com",
    "username": "ae_admin"
  }
}
```

### Tasks
| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/tasks` | JWT | List tasks. Supports `status`, `search`, and pagination query params. |
| POST | `/api/tasks` | JWT | Create a task owned by the requesting user. |
| GET | `/api/tasks/:id` | JWT | Retrieve a single task (enforces ownership). |
| PUT | `/api/tasks/:id` | JWT | Update title, status, tags, due dates, etc. |
| DELETE | `/api/tasks/:id` | JWT | Permanently delete a task. |

**Create Task Request**
```json
{
  "title": "Kick-off meeting",
  "description": "Schedule Q4 planning call",
  "status": "in-progress",
  "priority": "medium",
  "dueDate": "2025-10-07T09:00:00Z",
  "tags": ["planning", "team"]
}
```

**Create Task Response**
```json
{
  "success": true,
  "data": {
    "id": "66fde0123...",
    "title": "Kick-off meeting",
    "status": "in-progress",
    "priority": "medium",
    "dueDate": "2025-10-07T09:00:00Z"
  }
}
```

## Validation & Security
- **Password policy:** Minimum 8 chars, mixed case, numeric, and special characters enforced server-side.
- **JWT guard:** `protect` middleware validates tokens, attaches the user, and blocks revoked/invalid tokens.
- **Input sanitization:** express-validator normalizes and trims input; only whitelisted fields pass through.
- **Rate limiting:** `express-rate-limit` throttles repeated requests per IP.
- **CORS:** Restricts origins to `FRONTEND_URL`, preventing unauthorized browsers from accessing the API.
- **Helmet:** Adds secure HTTP headers for XSS and clickjacking mitigation.

## Error Handling & Responses
- **Validation errors:** Return 422 with a combined message and the array of field errors.
- **Authentication errors:** Return 401 or 403 with consistent messaging.
- **Unexpected errors:** Logged to the console and surfaced as 500 with a generic message.
- **Utility helpers:** `sendError` and `sendSuccess` keep JSON structures predictable for the frontend.

## Extensibility Ideas
- Add refresh tokens + device management for long-lived sessions.
- Introduce activity logs or audit trail per task.
- Wire up unit tests (Jest) and integration tests (Supertest) for key flows.
- Deploy via Docker + GitHub Actions for CI/CD-ready storytelling.

Armed with this overview, you can confidently discuss architecture decisions, security controls, and future enhancements during interviews or demos.
