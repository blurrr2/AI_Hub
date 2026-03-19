# AI·HUB — AI News & Learning Dashboard

A fullstack web application for tracking AI news, managing learning resources, and documenting coding progress.

**Live Demo:** https://blurrr2.github.io/AI_Hub

## Features

- **News Feed** — Aggregates AI news from OpenAI, Hugging Face, DeepMind, and German sources (heise.de, t3n.de). Search, filter by source/tag, bookmark articles.
- **Learning Library** — Save and organize learning resources (articles, videos, courses, papers). Filter by category, type, difficulty, and progress.
- **Coding Journal** — Document coding problems and solutions with Problem/Solution/Notes tabs. Track progress with difficulty and status tags.
- **Community** — Share journal entries publicly, like and comment on others' entries.
- **Dashboard** — Real-time stats (news read, resources saved, problems solved, streak). Quick actions for navigation.
- **User Profile** — Manage username and avatar. View account information.
- **Authentication** — JWT-based login/register with email password reset via Resend.
- **Dark/Light Theme** — Full theme support with CSS variables.
- **PWA** — Installable as mobile app from browser.
- **Responsive** — Mobile-first design with bottom navigation.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | PostgreSQL, Prisma ORM |
| Auth | JWT, bcrypt |
| Email | Resend API |
| RSS | rss-parser, node-cron |
| Deployment | GitHub Pages (frontend), Render (backend) |

## Architecture

```
AI_Hub/
├── frontend/          # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/   # Sidebar, BottomNav, MobileHeader, ResizableDivider
│   │   ├── pages/        # Dashboard, NewsFeed, Library, Journal, Community, Profile
│   │   ├── hooks/        # useIsMobile
│   │   └── context/      # ThemeContext
└── backend/           # Node.js + Express
    ├── src/
    │   ├── routes/       # auth, news, resources, problems, dashboard, community, user
    │   ├── middleware/   # authenticateToken
    │   └── services/     # newsSync
    └── prisma/
        └── schema.prisma
```

## Local Setup

### Prerequisites
- Node.js 18+
- PostgreSQL

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Fill in DATABASE_URL, JWT_SECRET, and RESEND_API_KEY
npx prisma migrate dev
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Deployment

- **Frontend:** GitHub Pages via `npm run deploy`
- **Backend:** Render.com (auto-deploy on push)
- **Database:** Render PostgreSQL

## News Sources

| Source | Language |
|--------|----------|
| OpenAI Blog | English |
| Hugging Face | English |
| DeepMind | English |
| heise.de | German |
| t3n.de | German |

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### News
- `GET /api/news` - Get all news articles
- `POST /api/news/sync` - Trigger news sync
- `POST /api/news/bookmark` - Bookmark an article
- `DELETE /api/news/bookmark/:id` - Remove bookmark

### Resources
- `GET /api/resources` - Get user's learning resources
- `POST /api/resources` - Add new resource
- `PUT /api/resources/:id` - Update resource
- `DELETE /api/resources/:id` - Delete resource

### Problems (Journal)
- `GET /api/problems` - Get user's coding problems
- `POST /api/problems` - Add new problem
- `PUT /api/problems/:id` - Update problem
- `DELETE /api/problems/:id` - Delete problem

### Community
- `GET /api/community` - Get public journal entries
- `GET /api/community/:id/comments` - Get comments for entry
- `POST /api/community/:id/comments` - Add comment
- `POST /api/community/:id/like` - Like entry
- `DELETE /api/community/:id/like` - Unlike entry

### User Profile
- `GET /api/user/profile` - Get current user profile
- `PUT /api/user/profile` - Update profile (avatar)
- `PUT /api/user/username` - Update username

### Dashboard
- `GET /api/dashboard/stats` - Get user activity statistics

## Screenshots

| Dashboard | News Feed |
|-----------|-----------|
| ![Dashboard](screenshots/dashboard.png) | ![News](screenshots/news.png) |

| Learning Library | Coding Journal |
|-----------------|----------------|
| ![Library](screenshots/library.png) | ![Journal](screenshots/journal.png) |

## License
MIT
