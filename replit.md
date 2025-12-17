# PharmaLog - Electronic Logbook System

## Overview

PharmaLog is a GMP-compliant electronic logbook system designed for the pharmaceutical industry. It replaces manual paper logbooks with a digital solution that tracks equipment activities, maintenance schedules, and provides complete audit trails aligned with 21 CFR Part 11, GAMP-5, and ALCOA+ compliance principles.

The system provides electronic activity logging, equipment master management, preventive maintenance scheduling, user management with role-based access control, and immutable audit trails for regulatory compliance.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript
- **Session Management**: express-session with PostgreSQL session store (connect-pg-simple)
- **Password Hashing**: bcrypt for secure password storage
- **API Design**: RESTful endpoints under `/api` prefix

### Data Storage
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with drizzle-zod for schema validation
- **Schema Location**: `shared/schema.ts` contains all table definitions
- **Migrations**: Drizzle Kit for database schema management (`db:push` command)

### Core Data Models
- **Users**: Role-based access (Operator, Supervisor, QA, Engineer, Admin)
- **Equipment**: Master list with status tracking and qualification status
- **Log Entries**: Activity logs with approval workflow (Draft → Submitted → Approved/Rejected)
- **Audit Trail**: Immutable record of all system actions
- **PM Schedules**: Preventive maintenance scheduling

### Authentication & Authorization
- Session-based authentication stored in PostgreSQL
- Role-based access control with five user roles
- Electronic signature support for log approvals (password verification)
- Session middleware protects authenticated routes

### Project Structure
```
├── client/           # React frontend application
│   └── src/
│       ├── components/   # UI components (shadcn/ui)
│       ├── pages/        # Page components
│       ├── lib/          # Utilities, API hooks, auth context
│       └── hooks/        # Custom React hooks
├── server/           # Express backend
│   ├── index.ts      # Server entry point
│   ├── routes.ts     # API route definitions
│   └── storage.ts    # Database operations
├── shared/           # Shared code between client/server
│   └── schema.ts     # Drizzle database schema
└── migrations/       # Database migrations
```

## External Dependencies

### Database
- **PostgreSQL**: Primary database accessed via `DATABASE_URL` environment variable
- **connect-pg-simple**: Session storage in PostgreSQL

### UI Framework
- **Radix UI**: Accessible component primitives (dialogs, dropdowns, tooltips, etc.)
- **Recharts**: Data visualization for dashboard charts
- **Lucide React**: Icon library

### Development Tools
- **Vite**: Frontend build tool with HMR
- **Drizzle Kit**: Database migration and push tooling
- **esbuild**: Server-side bundling for production

### Replit-Specific Integrations
- **@replit/vite-plugin-runtime-error-modal**: Error overlay for development
- **@replit/vite-plugin-cartographer**: Replit development tooling
- **@replit/vite-plugin-dev-banner**: Development environment indicator