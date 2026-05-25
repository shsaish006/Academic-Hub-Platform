# Academic Hub Platform

An institutional Learning Management System built for engineering colleges. The system manages academic departments, courses, faculty, student enrollments, coursework assignments, grading, and real-time class communications. It is designed to handle multi-department engineering curricula at scale, with role-based access for administrators, faculty, and students.

---

## Architecture

The platform follows a decoupled client-server architecture. The backend is a RESTful API server, and the frontend is a single-page application that communicates with it over HTTP.

```
classroom-backend/      Express.js REST API, PostgreSQL via Drizzle ORM
classroom-frontend/     Vite + React SPA using the Refine framework
```

The two applications run independently and are coordinated through a root-level npm workspace configuration that allows simultaneous execution during development.

---

## Tech Stack

### Backend

**Node.js** serves as the runtime environment. The server runs on Express.js version 5, which handles HTTP routing, middleware, and request/response lifecycle management.

**TypeScript** is used throughout the backend. All route handlers, database schemas, and business logic are fully typed.

**Drizzle ORM** handles all database interactions. The schema is defined in TypeScript, and migrations are generated and applied using the Drizzle Kit CLI. The ORM runs on top of the Neon serverless PostgreSQL driver.

**Neon PostgreSQL** is the database provider. It is a serverless PostgreSQL platform that supports HTTP-based connections, which eliminates the need to manage connection pools in a traditional sense. All schema definitions, relations, and foreign key constraints are managed through Drizzle.

**Better Auth** is the authentication library. It provides session-based email and password authentication, social OAuth (Google, GitHub), token management, and account linking. The auth schema (user, session, account, verification) lives alongside the application schema and is integrated directly with Drizzle.

**Arcjet** provides application-level security. It enforces rate limiting using a sliding window algorithm, detects and blocks malicious bot traffic, and applies shield protection against common attack patterns. It is configured as Express middleware and evaluated per request.

### Frontend

**React 19** is the UI library. Component logic, state management, and rendering are handled using standard React patterns with hooks.

**Vite** is the build tool and development server. It handles module bundling, hot module replacement, and TypeScript compilation for the frontend.

**Refine** is the data management framework. It provides data provider abstractions, routing utilities, identity management, and CRUD lifecycle hooks. The application uses a custom data provider built on top of the Refine REST adapter, which maps server responses to the format Refine expects.

**Tailwind CSS v4** is the styling system. Class-based utility styles are applied directly in component markup.

**Shadcn UI** provides the base component library. Components are built on Radix UI primitives and styled with Tailwind. The components used include Card, Badge, Button, Tabs, Dialog, ScrollArea, Input, Textarea, Avatar, Select, Separator, and Sidebar.

**Recharts** handles all data visualisation. The dashboard renders a bar chart for class capacity analysis, a pie chart for department distribution, and an area chart for institutional growth trends.

**Zod** is used for schema validation on form submissions. Validation schemas are defined in `src/lib/schema.ts` and applied through React Hook Form resolvers.

**Lucide React** provides the icon set used throughout the interface.

**Cloudinary** handles image storage and delivery. Class banner images and user profile pictures are uploaded to Cloudinary and referenced by their public ID in the database.

---

## Database Schema

The database contains 13 tables across two schema files.

### Auth Schema

| Table | Purpose |
|---|---|
| user | Stores registered users with role (admin, teacher, student), name, email, and image fields |
| session | Active login sessions with expiry timestamps |
| account | OAuth account links per user |
| verification | Email verification tokens |

### Application Schema

| Table | Purpose |
|---|---|
| departments | Academic departments with a short code and description |
| subjects | Curriculum subjects mapped to a department |
| classes | Course sessions assigned to a subject and teacher, with capacity, schedules, invite code, and status |
| enrollments | Student-to-class membership records |
| announcements | Class-scoped posts created by teachers |
| comments | Replies to announcements from any class member |
| assignments | Coursework tasks with title, description, due date, and max points |
| submissions | Student work linked to an assignment, supporting file URL, text content, grade, and feedback |
| materials | Reference documents, lecture notes, and links shared within a class |

---

## API Reference

All endpoints are prefixed with `/api`.

### Authentication

Handled by Better Auth at `/api/auth/*`. All session and account management is delegated to the library.

### Subjects

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/subjects | List subjects with optional search and department filter |
| POST | /api/subjects | Create a new subject |

### Classes

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/classes | List classes with search, subject, and teacher filters |
| GET | /api/classes/:id | Get full class details including teacher and department |
| POST | /api/classes | Create a new class session |

### LMS Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/lms/classes/:classId/announcements | Get all announcements for a class with nested comments |
| POST | /api/lms/classes/:classId/announcements | Post a new announcement |
| POST | /api/lms/announcements/:id/comments | Reply to an announcement |
| GET | /api/lms/classes/:classId/assignments | List all assignments in a class |
| POST | /api/lms/classes/:classId/assignments | Create a new assignment |
| GET | /api/lms/assignments/:id/submissions | List submissions for an assignment |
| POST | /api/lms/assignments/:id/submissions | Submit work for an assignment |
| PUT | /api/lms/submissions/:id/grade | Grade a submission and provide feedback |
| GET | /api/lms/classes/:classId/materials | List all study materials in a class |
| POST | /api/lms/classes/:classId/materials | Upload a new study material |

### Users

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/users | List users with optional role filter |

---

## Academic Seed Data

The repository includes a seed script at `classroom-backend/src/seed.ts` that populates the database with a complete engineering institution dataset.

Running `npm run db:seed` from the backend directory will insert:

- 8 engineering departments: Computer Science and Engineering, Electronics and Communication Engineering, Mechanical Engineering, Biotechnology, Chemical Engineering, Mathematics and Computing, Civil Engineering, Electrical Engineering
- Over 240 subjects with codes, names, and detailed descriptions covering all four years of an engineering curriculum
- 30 Indian faculty profiles with realistic names and institutional email addresses mapped to departments

The seed uses `onConflictDoNothing` so it is safe to run multiple times without creating duplicates.

---

## Repository Structure

```
Academic-Hub-Platform/
  classroom-backend/
    src/
      config/         Arcjet configuration
      db/
        schema/       Drizzle schema definitions (app.ts, auth.ts)
      lib/            Better Auth setup
      middleware/     Security and request middleware
      routes/         Express routers (subjects, classes, users, lms)
      seed.ts         Database seed script
      index.ts        Application entry point
    drizzle/          Generated migration files
    drizzle.config.ts Drizzle Kit configuration
    package.json
    tsconfig.json
  classroom-frontend/
    src/
      components/     Refine UI components and Shadcn UI base components
      constants/      Application constants and environment variable access
      hooks/          Custom React hooks
      lib/            Zod schemas, Cloudinary helpers, utility functions
      pages/          Dashboard, classes, subjects pages
      providers/      Custom Refine data provider
      types/          TypeScript interfaces
    index.html
    vite.config.ts
    package.json
    tsconfig.json
  package.json        Root workspace configuration
  README.md
  .gitignore
```

---

## Setup

### Prerequisites

- Node.js 18 or later
- A Neon PostgreSQL project with a connection string
- An Arcjet account with an API key
- A Cloudinary account with a cloud name and upload preset

### Environment Variables

**classroom-backend/.env**

```
DATABASE_URL=
BETTER_AUTH_SECRET=
FRONTEND_URL=http://localhost:5173
ARCJET_KEY=
ARCJET_ENV=development
```

**classroom-frontend/.env**

```
VITE_BACKEND_BASE_URL=http://localhost:8000/api/
VITE_CLOUDINARY_CLOUD_NAME=
VITE_CLOUDINARY_UPLOAD_PRESET=
VITE_CLOUDINARY_UPLOAD_URL=
```

### Installation

Install dependencies for both workspaces from the root directory.

```bash
npm install --legacy-peer-deps
```

### Database Setup

From the backend directory, generate and apply migrations, then run the seed.

```bash
cd classroom-backend
npm run db:generate
npm run db:migrate
npm run db:seed
```

### Running the Application

From the root directory, start both servers.

```bash
npm run dev
```

The backend server runs at http://localhost:8000. The frontend application runs at http://localhost:5173.

---

## Role System

The platform supports three roles.

An **Admin** has full access to all departments, subjects, classes, and user accounts. Admins can create subjects, publish classes, manage faculty assignments, and view all data.

A **Teacher** can create classes under subjects they are assigned to, publish announcements, create assignments, review student submissions, and assign grades.

A **Student** can enroll in classes using an invite code, view announcements, comment on posts, submit assignments, and access shared study materials.

---

## Security

Rate limiting is enforced through Arcjet using a sliding window of 5 requests per 2 seconds. Bot detection blocks automated traffic while allowing search engine crawlers. Shield protection is active in live mode on all routes. The Arcjet key should be kept private and never committed to version control.

---

## License

MIT License. This project is provided for educational and institutional use.
