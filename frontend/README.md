# MeetWise — AI Meeting Summarizer Frontend

Built with React + Vite + TypeScript + Tailwind CSS + shadcn/ui + Framer Motion + Zustand + Axios + React Router DOM + React Hook Form + Zod.

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy and configure env
cp .env.example .env
# Edit .env and set VITE_API_BASE_URL to your Django backend URL

# 3. Start dev server
npm run dev
```

## Stack

- React 18 + TypeScript
- Vite 6
- Tailwind CSS v4
- shadcn/ui (New York style)
- Framer Motion (animations)
- Zustand (auth + theme state)
- Axios (with JWT interceptors + auto-refresh)
- React Router DOM v6 (client-side routing)
- React Hook Form + Zod (form validation)
- TanStack React Query (data fetching & caching)
- Sonner (toast notifications)
- date-fns (date formatting)
- Lucide React (icons)

## Features

- Landing page with hero, features, pricing, testimonials, live demo
- Authentication: Login, Register, Forgot Password (JWT / Bearer token)
- Dashboard with stats, credit usage bar, recent meetings
- Meetings list (grid + table views, search, filter by status, pagination)
- New meeting summary form with file drag-and-drop
- Meeting detail page with collapsible sections: summary, sentiment, key points, action items, decisions, attendees
- Credits page with purchase packages
- Settings: profile, password change, notification preferences, account deletion
- Dark mode default (purple→blue gradients, glassmorphism)
- Fully responsive (mobile sidebar)

## API Endpoints (Django backend)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register/ | Register |
| POST | /api/auth/login/ | Login (returns access + refresh JWT) |
| GET | /api/auth/profile/ | Get current user |
| PATCH | /api/auth/profile/ | Update profile |
| POST | /api/auth/change-password/ | Change password |
| POST | /api/auth/forgot-password/ | Send reset email |
| GET | /api/meet/meetings/ | List meetings |
| POST | /api/meet/meetings/ | Create meeting |
| GET | /api/meet/meetings/:id/ | Get meeting |
| PUT | /api/meet/meetings/:id/ | Update meeting |
| DELETE | /api/meet/meetings/:id/ | Delete meeting |
| GET | /api/meet/meetings/:id/summary/ | Get AI summary |
| POST | /api/meet/meetings/:id/generate-summary/ | Generate summary (costs 1 credit) |
| GET | /api/meet/meetings/statistics/ | Usage statistics |

## Auth Flow

JWT stored in localStorage (`access_token`, `refresh_token`). Axios interceptors auto-refresh on 401.
