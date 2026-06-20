# MemoryMate Backend

Node.js + Express + Prisma API for the MemoryMate dementia care app.

## Quick Start

### 1. Install dependencies
```bash
cd memorymate-backend
npm install
```

### 2. Set up the database
```bash
# Generate Prisma client
npm run db:generate

# Run migrations (creates the SQLite database)
npm run db:migrate

# Seed with demo data
npm run db:seed
```

### 3. Start the development server
```bash
npm run dev
```

Server runs at: http://localhost:3000
Health check: http://localhost:3000/health

## Demo Accounts (after seeding)
| Role | Email | Password | Notes |
|------|-------|----------|-------|
| Patient | patient@demo.com | password123 | Invite code: DEMO01 |
| Caregiver | caregiver@demo.com | password123 | Already linked to patient |

## Environment Variables
Copy `.env.example` to `.env`. The defaults work for local development (SQLite, no Firebase).

## API Overview

All protected routes require: `Authorization: Bearer <token>`

### Auth
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /auth/register | No | Register (role: PATIENT or CAREGIVER) |
| POST | /auth/login | No | Login, returns JWT |
| GET | /auth/me | Yes | Get current user |
| POST | /auth/link-patient | Yes | Caregiver links via invite code |
| PATCH | /auth/fcm-token | Yes | Update device push token |

### Faces
| Method | Path | Description |
|--------|------|-------------|
| GET | /patients/:id/faces | List known faces |
| POST | /patients/:id/faces | Upload face photo (multipart) |
| POST | /patients/:id/faces/match | Match embedding vector |
| PATCH | /faces/:id | Update face name/relationship |
| DELETE | /faces/:id | Delete face |

### Routines
| Method | Path | Description |
|--------|------|-------------|
| GET | /patients/:id/routines | List routines |
| POST | /patients/:id/routines | Create routine |
| PATCH | /routines/:id | Update routine |
| DELETE | /routines/:id | Soft-delete routine |
| POST | /routines/:id/log | Mark completed/snoozed |
| GET | /routines/:id/logs | Get log history |

### Safe Zones
| Method | Path | Description |
|--------|------|-------------|
| GET | /patients/:id/zones | List zones |
| POST | /patients/:id/zones | Create zone |
| PATCH | /zones/:id | Update zone |
| DELETE | /zones/:id | Soft-delete zone |
| POST | /zones/:id/event | Report enter/exit event |

### Activity & Notifications
| Method | Path | Description |
|--------|------|-------------|
| GET | /patients/:id/activity | Activity log (filterable) |
| GET | /caregivers/:id/notifications | Get notifications |
| PATCH | /notifications/:id/read | Mark one read |
| PATCH | /caregivers/:id/notifications/read-all | Mark all read |

## Project Structure
```
memorymate-backend/
├── prisma/
│   ├── schema.prisma      ← All database models
│   └── seed.js            ← Demo data seeder
├── src/
│   ├── index.js           ← Express app + all routes
│   ├── config.js          ← Environment config
│   ├── middleware/        ← auth, roleCheck, errorHandler
│   ├── controllers/       ← Business logic (one file per domain)
│   ├── services/          ← tokenService, notifyService, cronService
│   └── utils/             ← response helpers, inviteCode
└── uploads/               ← Local face photo storage
```
