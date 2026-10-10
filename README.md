# ARX IT CLUB OF SJS — Modern Web Platform & Member Portal

> **"Learn. Build. Grow."**

🌐 **Live Website**: [https://arx-website-seven.vercel.app](https://arx-website-seven.vercel.app)  
🚀 **Latest Deployment**: [https://arx-website-0-arx-a2b1.vercel.app](https://arx-website-0-arx-a2b1.vercel.app)  
📦 **Deployment ID URL**: [https://arx-website-d0p6cbn10-arx-a2b1.vercel.app](https://arx-website-d0p6cbn10-arx-a2b1.vercel.app)

A complete, modern, professional website and student member portal for ARX IT CLUB OF SJS. Built with React, TypeScript, Tailwind CSS, Node.js, Express, and cloud database persistence for Vercel serverless deployment.

---

## 1. Project Structure

```
├── backend/
│   └── src/
│       ├── config/            # Environment and application constants
│       ├── controllers/       # REST API route controllers
│       │   ├── authController.ts
│       │   ├── memberController.ts
│       │   ├── courseController.ts
│       │   ├── certificateController.ts
│       │   ├── projectController.ts
│       │   ├── eventController.ts
│       │   ├── achievementController.ts
│       │   └── statsController.ts
│       ├── middleware/        # Bearer JWT auth verification & error handling
│       │   └── authMiddleware.ts
│       ├── models/            # Entity interfaces & data models
│       │   └── types.ts
│       ├── routes/            # Express routers mounted under /api
│       │   ├── authRoutes.ts
│       │   ├── memberRoutes.ts
│       │   ├── courseRoutes.ts
│       │   ├── certificateRoutes.ts
│       │   ├── projectRoutes.ts
│       │   ├── eventRoutes.ts
│       │   ├── achievementRoutes.ts
│       │   ├── statsRoutes.ts
│       │   └── index.ts
│       ├── services/          # Data persistence layer & business logic
│       │   └── db.ts
│       └── utils/             # ID generation, password hashing & JWT utils
│           ├── idGenerator.ts    # Generates TI + 6 digits (e.g. TI482913)
│           ├── jwtUtils.ts       # HMAC-SHA256 signed token generation
│           └── passwordUtils.ts  # PBKDF2 salted hash comparison
├── src/
│   ├── components/
│   │   ├── common/            # Reusable Button, Card, Badge, Modal, CertificateModal
│   │   ├── layout/            # Responsive Navbar and Footer
│   │   └── portal/            # Member portal sidebar & headers
│   ├── context/
│   │   └── AuthContext.tsx    # Global auth provider, session state & handlers
│   ├── pages/                 # Public & portal pages
│   │   ├── HomePage.tsx
│   │   ├── AboutPage.tsx
│   │   ├── CoursesPage.tsx
│   │   ├── CourseDetailPage.tsx
│   │   ├── ProjectsPage.tsx
│   │   ├── EventsPage.tsx
│   │   ├── AchievementsPage.tsx
│   │   ├── CertificatesVerifyPage.tsx
│   │   ├── ContactPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   └── portal/
│   │       ├── DashboardPage.tsx
│   │       ├── MyCoursesPage.tsx
│   │       ├── MyCertificatesPage.tsx
│   │       ├── MyAwardsPage.tsx
│   │       ├── MyProjectsPage.tsx
│   │       ├── MyProfilePage.tsx
│   │       └── ChangePasswordPage.tsx
│   ├── services/
│   │   └── api.ts             # Typed REST API service layer
│   ├── types/
│   │   └── index.ts           # Shared frontend TypeScript interfaces
│   ├── App.tsx                # Client router and page views
│   ├── index.css              # Tailwind CSS styles and print media rules
│   └── main.tsx               # React DOM entry point
├── server.ts                  # Node.js Express server mounting Vite in dev
├── package.json
└── tsconfig.json
```

---

## 2. Frontend Setup Instructions

The frontend is built using:
- **React 19**
- **Tailwind CSS 4**
- **Lucide Icons**
- **Canvas-Confetti**

### Running the Frontend
In development, the Vite dev middleware runs unified with the Node.js server:
```bash
npm run dev
```

To build production static assets:
```bash
npm run build
```

---

## 3. Node.js Backend Setup Instructions

The backend runs on Express with TypeScript via `tsx`:
- Entry point: `server.ts`
- Routes mounted under: `/api/*`
- Port: `3000` (configurable via `PORT` env var)

In production:
```bash
npm run build
npm start
```

---

## 4. Environment Variables Required

See `.env.example`:
```env
PORT=3000
JWT_SECRET="your-secure-jwt-secret-key-change-in-production"
TELEGRAM_BOT_USERNAME="ARXITCLUB_bot"
TELEGRAM_BOT_URL="https://t.me/ARXITCLUB_bot"
TELEGRAM_CHANNEL_LINK="https://t.me/nexoraitclub"
```

---

## 5. API Endpoint Documentation

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register member, returns generated `TIxxxxxx` Member ID | No |
| `POST` | `/api/auth/login` | Login using Member ID & Password | No |
| `POST` | `/api/auth/logout` | Invalidate/clear session | No |
| `GET` | `/api/auth/me` | Fetch currently authenticated member profile | Yes |

### Member Portal (`/api/members`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/members` | Public safe directory (Name, Member ID, Class — no private info) | No |
| `GET` | `/api/members/profile` | Current member details | Yes |
| `PUT` | `/api/members/profile` | Update profile (Member ID is immutable) | Yes |
| `POST` | `/api/members/change-password` | Update member password | Yes |
| `GET` | `/api/members/courses` | Enrolled courses with percentage progress | Yes |
| `GET` | `/api/members/certificates` | Member's earned certificates | Yes |
| `GET` | `/api/members/awards` | Member's awards & distinctions | Yes |
| `GET` | `/api/members/projects` | Projects associated with member | Yes |
| `GET` | `/api/members/dashboard-summary` | Portal counters & recent activities | Yes |

### Courses (`/api/courses`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/courses` | List all courses (supports `?category=` and `?search=`) | No |
| `GET` | `/api/courses/:id` | Get course details & syllabus | No |
| `POST` | `/api/courses/:id/enroll` | Enroll member in course | Yes |

### Certificates (`/api/certificates`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/certificates/verify/:certificateId` | Public verification (e.g. `ITC-PY-2026-00421`) | No |
| `GET` | `/api/certificates/:id` | Fetch full certificate data for rendering | No |

### Projects, Events & Stats
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/projects` | List projects showcase | No |
| `GET` | `/api/events` | List events (`?status=Upcoming` or `?status=Past`) | No |
| `POST` | `/api/events/:id/register` | Register for an event | Optional |
| `GET` | `/api/achievements` | List club & member awards | No |
| `GET` | `/api/stats` | Active members, courses, projects, and events counts | No |

---

## 6. Database Model Explanation

Entities are defined in `backend/src/models/types.ts`:
- **Member**: `id`, `memberId` (`TI` + 6 digits), `studentName`, `class`, `passwordHash`, `phoneNumber`, `telegramUsername`, `award`, `role`, `createdAt`.
- **SafeMember**: Excludes `passwordHash` and `phoneNumber` for privacy.
- **Course**: `id`, `title`, `description`, `topics`, `learningObjectives`, `difficulty`, `duration`, `instructor`, `status`.
- **Enrollment**: `id`, `memberId`, `courseId`, `progress` (0–100%), `status`, `certificateId`.
- **Certificate**: `id`, `certificateId` (`ITC-XX-YYYY-NNNNN`), `memberId`, `studentName`, `courseName`, `issueDate`, `status` (`VERIFIED`), `authorizedSignatures`.
- **Project**, **EventItem**, **Achievement**, **Activity**.

The database store in `backend/src/services/db.ts` acts as a clean abstraction that can be swapped for PostgreSQL, Cloud SQL, MongoDB, or Prisma without touching the controllers.

---

## 7. Authentication Flow Explanation

1. **Registration**: Student fills name, class, password, phone, telegram handle, and optional award.
2. The server programmatically generates a unique 6-digit Member ID prefixed with `TI` (e.g., `TI482913`).
3. Passwords are salted and hashed using PBKDF2 (`backend/src/utils/passwordUtils.ts`).
4. An HMAC-SHA256 bearer token is returned and stored in browser `localStorage`.
5. Subsequent API requests pass `Authorization: Bearer <token>`.
6. Passwords can be securely updated via `POST /api/members/change-password`.

---

## 8. Telegram Integration Explanation

- **Official Bot**: `@ARXITCLUB_bot` (`https://t.me/ARXITCLUB_bot`) handles account linking, secure `/start <token>` activation sessions, and member verification.
- **Preserved Channel**: `@nexoraitclub` (`https://t.me/nexoraitclub`) serves as the official broadcast channel for student lab schedules, curriculum notices, and announcements.
- **Authoritative Identity**: Account linking associates the user's permanent Telegram numeric user ID, while verifying channel membership against `@nexoraitclub`.
- **Privacy Guarantee**: Telegram handles and phone numbers are never exposed in public directories.

---

## 9. Certificate Verification Flow

1. Any student, teacher, or external party visits `/certificates`.
2. Enter a Certificate ID (e.g. `ITC-PY-2026-00421`).
3. The server checks the credential registry.
4. If found, displays `VERIFIED` status, student name, course name, issue date, and official authority signatures.
5. Users can open the full-fidelity printable certificate with gold seal, borders, and print/save to PDF.

---

## 10. Sample Test Credentials

- **Nahom Girma**: Member ID `TI482913` | Password: `password123`
- **Abel Tesfaye**: Member ID `TI735204` | Password: `password123`
- **Sample Verified Certificate**: `ITC-PY-2026-00421` (Python Basics)
- **Sample Verified Certificate**: `ITC-WD-2026-00398` (Web Development)
