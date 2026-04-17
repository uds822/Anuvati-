# Anuvati Foundational Framework

A full-stack web platform for **Anuvati** — a nonprofit organization managing public-facing content, internal HR operations, and program/CRM workflows from a single codebase.

## Overview

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| UI | shadcn/ui + Radix UI + Tailwind CSS |
| Animations | Framer Motion |
| Backend / Auth / DB | Supabase (Postgres + Auth + Storage) |
| Forms | React Hook Form + Zod |
| Data fetching | TanStack Query v5 |
| Charts | Recharts |
| PDF export | jsPDF + jsPDF-AutoTable |

## Project Structure

```
frontend/
└── src/
    ├── pages/
    │   ├── (public)        # Home, About, Blog, Campaigns, Events, Donate, …
    │   ├── crm/            # Program CRM — students, teachers, sessions, funders, …
    │   └── hr/             # Internal HR — employees, payroll, leave, recruitment, …
    ├── components/
    │   ├── home/           # Landing-page sections
    │   ├── layout/         # Nav, footer, shell
    │   ├── shared/         # Reusable cross-feature components
    │   └── ui/             # shadcn/ui primitives
    ├── contexts/           # AuthContext (Supabase session)
    ├── hooks/              # Custom React hooks
    ├── integrations/       # Supabase client + generated types
    └── data/               # Static/seed data
supabase/
    ├── migrations/         # SQL migrations
    └── functions/          # Edge functions
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- A Supabase project — [supabase.com](https://supabase.com)

### Local Development

```sh
# 1. Clone the repository
git clone <YOUR_GIT_URL>
cd anuvati-foundational-framework

# 2. Install dependencies
cd frontend
npm install

# 3. Configure environment variables
cp .env.example .env
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

# 4. Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest test suite |
| `npm run test:watch` | Watch mode for tests |

## Key Features

### Public Site
- Landing page with hero, impact stats, focus areas, campaigns, news, and partner strip
- About, Our Story, Our Team, Advisory Board, Governance, Transparency pages
- Blog / Knowledge Hub with markdown rendering
- Donate, Get Involved, Partner With Us, Careers, Events, Contact pages
- Social Days program page and Safeguarding banner

### CRM (Program Management)
Role-gated internal portal covering:
- Students, teachers, schools, sessions, attendance
- Funders, payments, issues, gallery, reports

### HR Module
Full employee lifecycle management:
- Employees, departments, recruitment, onboarding/offboarding
- Payroll, leave, attendance, performance, training
- Assets, compliance, grievances, CSR, volunteers, projects

## Authentication

Authentication is handled by Supabase Auth via `AuthContext`. The CRM and HR modules require login (`CrmLogin` / Supabase session). Role-based access is enforced at the route level.

## Database

Migrations live in `supabase/migrations/`. Apply them with the Supabase CLI:

```sh
supabase db push
```

## Deployment

Build the frontend and serve the `dist/` folder from any static host (Vercel, Netlify, Cloudflare Pages, etc.). Point `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables in your host dashboard.

```sh
npm run build   # outputs to frontend/dist/
```

## Contact

**Anuvati** — [contact@anuvati.org](mailto:contact@anuvati.org)
