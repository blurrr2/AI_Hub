# AI Hub — Complete Development Guide 🚀
**VS Code + Claude Code · React + Node.js · Dark/Light Theme Toggle**
*Duales Studium Informatik Application Project*

---

## Table of Contents
1. [Chapter 0: Install Tools](#chapter-0-install-tools)
2. [Chapter 1: Project Structure](#chapter-1-create-project-structure)
3. [Chapter 2: Database Design](#chapter-2-database-design-prisma-schema)
4. [Chapter 3: Backend Development](#chapter-3-backend-development-nodejs--express)
5. [Chapter 4: Frontend Development](#chapter-4-frontend-development-react--typescript)
6. [Chapter 5: Dark/Light Theme Toggle](#chapter-5-darklight-theme-toggle)
7. [Chapter 6: PWA Setup](#chapter-6-pwa-setup)
8. [Chapter 7: Deployment](#chapter-7-deployment)
9. [Chapter 8: Troubleshooting](#chapter-8-troubleshooting)
10. [Chapter 9: Interview Talking Points](#chapter-9-interview-talking-points)

---

## Chapter 0: Install Tools

Get all tools installed before writing a single line of code. This only needs to be done once.

| Tool | Purpose | Download |
|------|---------|----------|
| Node.js (v20+) | Run JavaScript backend, npm package manager | nodejs.org → Download LTS |
| VS Code | Code editor, main development environment | code.visualstudio.com |
| Claude Code | AI coding assistant, runs in terminal | See installation below |
| Git | Version control, save code history | git-scm.com |
| PostgreSQL | Database, stores all data | postgresql.org |
| Thunder Client | Test API endpoints | Search in VS Code Extensions |

### Install Claude Code (Important!)

Claude Code is your most powerful development tool. It runs directly in the VS Code terminal and can write code, fix bugs, and explain errors — like having a developer sitting next to you.

```bash
# Step 1: Open terminal and install
npm install -g @anthropic-ai/claude-code

# Step 2: Navigate to your project folder and start
claude
```

> 💡 Unlike the Claude web interface, Claude Code can directly read your files, modify them, and run commands in your terminal.

### Required VS Code Extensions

- **ESLint** — Code quality checks, catches syntax errors
- **Prettier** — Auto-formats code for consistency
- **Prisma** — Syntax highlighting for database schemas
- **Tailwind CSS IntelliSense** — CSS class name autocomplete
- **Thunder Client** — Test APIs directly inside VS Code
- **GitLens** — View code change history
- **ES7+ React Snippets** — React code snippet shortcuts

---

## Chapter 1: Create Project Structure

The project is split into two independent parts: `frontend` (React) and `backend` (Node.js).

### 1.1 Create Project Folders

```bash
mkdir AI_Hub
cd AI_Hub
mkdir frontend backend
```

### 1.2 Initialize Backend

```bash
cd backend
npm init -y

# Install all backend dependencies at once
npm install express cors dotenv jsonwebtoken bcrypt resend
npm install prisma @prisma/client rss-parser node-cron axios cheerio

# Install dev tools (nodemon = auto-restart server on file changes)
npm install -D nodemon

# Initialize Prisma (database ORM)
npx prisma init
```

> 💡 After running `npx prisma init`, it automatically generates `prisma/schema.prisma` and a `.env` file.

### 1.3 Initialize Frontend

```bash
cd ../frontend

# Create React + TypeScript project with Vite (much faster than create-react-app)
npm create vite@latest . -- --template react-ts
npm install

# Install frontend dependencies
npm install react-router-dom axios

# Install dev dependencies
npm install -D gh-pages
```

### 1.4 Final Folder Structure

```
AI_Hub/
├── frontend/
│   ├── src/
│   │   ├── components/     ← Reusable UI components (Sidebar, BottomNav, etc.)
│   │   ├── pages/          ← Page components (Dashboard, News, Library, Journal, Community, Profile)
│   │   ├── hooks/          ← Custom React Hooks (useIsMobile)
│   │   ├── context/        ← Theme Context (theme switching)
│   │   └── App.tsx         ← Root component, routing lives here
│   ├── public/
│   │   ├── manifest.json   ← PWA manifest
│   │   └── sw.js           ← Service worker
│   └── index.html
├── backend/
│   ├── src/
│   │   ├── routes/         ← API routes (/api/news, /api/resources, /api/user...)
│   │   ├── middleware/     ← JWT verification (authenticateToken)
│   │   ├── services/       ← RSS fetching, cron jobs
│   │   └── app.js          ← Express entry point
│   ├── prisma/
│   │   ├── schema.prisma   ← Database schema definition
│   │   └── migrations/     ← Database migration history
│   └── .env                ← Secrets (never upload to GitHub!)
├── .gitignore
└── README.md
```

---

## Chapter 2: Database Design (Prisma Schema)

Open `backend/prisma/schema.prisma` and replace the contents with:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// Users table
model User {
  id         Int              @id @default(autoincrement())
  email      String           @unique
  username   String           @unique
  password   String
  avatar     String?
  createdAt  DateTime         @default(now())
  resources  Resource[]
  problems   CodingProblem[]
  activities UserActivity[]
  bookmarks  Bookmark[]
  comments   Comment[]
  likes      Like[]
}

// News articles table
model NewsArticle {
  id          Int        @id @default(autoincrement())
  title       String
  url         String     @unique
  source      String
  tags        String[]
  publishedAt DateTime
  createdAt   DateTime   @default(now())
  bookmarks   Bookmark[]
}

// Bookmarks table
model Bookmark {
  id        Int          @id @default(autoincrement())
  userId    Int
  articleId Int
  user      User         @relation(fields: [userId], references: [id])
  article   NewsArticle  @relation(fields: [articleId], references: [id])
  createdAt DateTime     @default(now())

  @@unique([userId, articleId])
}

// Learning resources table
model Resource {
  id         Int      @id @default(autoincrement())
  userId     Int
  user       User     @relation(fields: [userId], references: [id])
  title      String
  url        String
  type       String
  category   String
  difficulty String   @default("beginner")
  progress   String   @default("not_started")
  notes      String?
  createdAt  DateTime @default(now())
}

// Coding Journal entries table
model CodingProblem {
  id          Int       @id @default(autoincrement())
  userId      Int
  user        User      @relation(fields: [userId], references: [id])
  title       String
  description String?
  problem     String?
  solution    String?
  learned     String?
  difficulty  String    @default("medium")
  status      String    @default("in_progress")
  visibility  String    @default("private")
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  comments    Comment[]
  likes       Like[]
}

// Comments table
model Comment {
  id        Int           @id @default(autoincrement())
  userId    Int
  problemId Int
  content   String
  user      User          @relation(fields: [userId], references: [id])
  problem   CodingProblem @relation(fields: [problemId], references: [id])
  createdAt DateTime      @default(now())
}

// Likes table
model Like {
  id        Int           @id @default(autoincrement())
  userId    Int
  problemId Int
  user      User          @relation(fields: [userId], references: [id])
  problem   CodingProblem @relation(fields: [problemId], references: [id])
  createdAt DateTime      @default(now())

  @@unique([userId, problemId])
}

// User activity tracking table
model UserActivity {
  id        Int      @id @default(autoincrement())
  userId    Int
  user      User     @relation(fields: [userId], references: [id])
  type      String
  date      DateTime @default(now())
}

// Password reset tokens table
model PasswordResetToken {
  id        Int      @id @default(autoincrement())
  email     String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
}
```

### Run Database Migrations

```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
```

---

## Chapter 3: Backend Development (Node.js + Express)

### 3.1 Environment Variables

Create `backend/.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/aihub"
JWT_SECRET="your-super-secret-jwt-key-change-this"
RESEND_API_KEY="re_your_resend_api_key"
PORT=3000
```

### 3.2 Backend Structure

```
backend/src/
├── routes/
│   ├── auth.js          ← Login, register, password reset
│   ├── news.js          ← News feed, bookmarks, sync
│   ├── resources.js     ← Learning library CRUD
│   ├── problems.js      ← Coding journal CRUD
│   ├── community.js     ← Public entries, comments, likes
│   ├── user.js          ← User profile, avatar, username
│   └── dashboard.js     ← Activity stats
├── middleware/
│   └── auth.js          ← JWT authentication middleware
├── services/
│   └── newsSync.js      ← RSS feed fetching with node-cron
└── app.js               ← Express server entry point
```

### 3.3 Key Backend Features

**Authentication (JWT + bcrypt)**
- Register: Hash password with bcrypt, create user, return JWT token
- Login: Verify password, return JWT token
- Password Reset: Generate token, send email via Resend API

**News Sync Service**
- Uses `rss-parser` to fetch from OpenAI, Hugging Face, DeepMind, heise.de, t3n.de
- Runs every 6 hours via `node-cron`
- Stores articles in PostgreSQL, prevents duplicates with unique URL constraint

**CORS Configuration**
```javascript
app.use(cors({
  origin: ['http://localhost:5173', 'https://blurrr2.github.io'],
  credentials: true
}));
```

**Middleware: authenticateToken**
```javascript
export const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};
```

### 3.4 Start Backend

```bash
cd backend
npm run dev
```

Backend runs on `http://localhost:3000`

---

## Chapter 4: Frontend Development (React + TypeScript)

### 4.1 Frontend Structure

```
frontend/src/
├── components/
│   ├── Sidebar.tsx           ← Desktop navigation
│   ├── BottomNav.tsx         ← Mobile navigation
│   ├── MobileHeader.tsx      ← Mobile top bar
│   └── ResizableDivider.tsx  ← Resizable split pane
├── pages/
│   ├── Dashboard.tsx         ← Activity stats, quick actions
│   ├── NewsFeed.tsx          ← News articles, search, filter, bookmark
│   ├── Library.tsx           ← Learning resources CRUD
│   ├── Journal.tsx           ← Coding problems with tabs
│   ├── Community.tsx         ← Public entries, comments, likes
│   ├── Profile.tsx           ← User profile, avatar upload
│   ├── Login.tsx             ← Login form
│   ├── Register.tsx          ← Register form
│   ├── ForgotPassword.tsx    ← Password reset request
│   └── ResetPassword.tsx     ← Password reset form
├── hooks/
│   └── useIsMobile.tsx       ← Detect mobile viewport
├── context/
│   └── ThemeContext.tsx      ← Dark/light theme state
└── App.tsx                   ← Routes, theme provider
```

### 4.2 Key Frontend Features

**Responsive Design**
- Desktop: Sidebar navigation
- Mobile: Bottom navigation + top header
- `useIsMobile` hook detects viewport width < 768px

**Theme System**
- CSS variables in `index.css` for colors
- ThemeContext provides `theme` and `toggleTheme`
- Persists to localStorage

**API Integration**
- All API calls use axios with JWT token in Authorization header
- Base URL switches between localhost (dev) and Render (production)

**PWA Features**
- Service worker caches assets for offline use
- Manifest.json for installability
- Network-first strategy for API calls

### 4.3 Start Frontend

```bash
cd frontend
npm run dev
```

Frontend runs on `http://localhost:5173`

---

## Chapter 5: Dark/Light Theme Toggle

### 5.1 CSS Variables (`frontend/src/index.css`)

```css
:root {
  --bg: #ffffff;
  --surface: #f8f9fa;
  --surface2: #e9ecef;
  --border: #dee2e6;
  --ink: #212529;
  --ink2: #495057;
  --ink3: #6c757d;
}

[data-theme="dark"] {
  --bg: #1a1a1a;
  --surface: #242424;
  --surface2: #2d2d2d;
  --border: #3a3a3a;
  --ink: #e9ecef;
  --ink2: #adb5bd;
  --ink3: #6c757d;
}
```

### 5.2 Theme Context (`frontend/src/context/ThemeContext.tsx`)

```tsx
import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext<{
  theme: string;
  toggleTheme: () => void;
}>({ theme: 'light', toggleTheme: () => {} });

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') || 'light'
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
```

### 5.3 Usage in Components

```tsx
import { useTheme } from '../context/ThemeContext';

function Sidebar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme}>
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}
```

---

## Chapter 6: PWA Setup

### 6.1 Manifest (`frontend/public/manifest.json`)

```json
{
  "name": "AI Hub",
  "short_name": "AI Hub",
  "description": "AI News & Learning Dashboard",
  "start_url": "/AI_Hub/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#c8401a",
  "icons": [
    {
      "src": "/AI_Hub/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/AI_Hub/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 6.2 Service Worker (`frontend/public/sw.js`)

```javascript
const CACHE_NAME = 'ai-hub-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/AI_Hub/',
        '/AI_Hub/index.html',
        '/AI_Hub/manifest.json'
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Network-first strategy for API calls
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
  } else {
    // Cache-first for static assets
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});
```

### 6.3 Register Service Worker (`frontend/index.html`)

```html
<script>
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/AI_Hub/sw.js');
  }
</script>
```

---

## Chapter 7: Deployment

### 7.1 Backend Deployment (Render.com)

1. Push code to GitHub
2. Go to render.com → New Web Service
3. Connect GitHub repo
4. Configure:
   - **Build Command:** `cd backend && npm install && npx prisma generate`
   - **Start Command:** `cd backend && node src/app.js`
   - **Environment Variables:** Add DATABASE_URL, JWT_SECRET, RESEND_API_KEY

5. Create PostgreSQL database on Render
6. Copy database URL to environment variables

### 7.2 Frontend Deployment (GitHub Pages)

**Update `frontend/vite.config.ts`:**
```typescript
export default defineConfig({
  base: '/AI_Hub/',
  plugins: [react()]
});
```

**Update `frontend/package.json`:**
```json
{
  "homepage": "https://blurrr2.github.io/AI_Hub",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

**Deploy:**
```bash
cd frontend
npm run deploy
```

### 7.3 Database Migrations on Render

```bash
# Set environment variable
$env:DATABASE_URL="your_render_postgres_url"

# Run migration
cd backend
npx prisma migrate deploy
```

---

## Chapter 8: Troubleshooting

### Common Issues

**1. CORS Error**
- Check backend CORS origin includes your frontend URL
- Verify Authorization header is sent with Bearer token

**2. 404 on API Routes**
- Check route is registered in `backend/src/app.js`
- Verify route path matches frontend API call

**3. JWT Token Issues**
- Token field in JWT is `userId`, not `id`
- Use `req.user.userId` in backend routes

**4. Database Connection Failed**
- Verify DATABASE_URL format: `postgresql://user:pass@host:port/db`
- Check PostgreSQL is running

**5. Build Errors**
- Clear node_modules: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run build`

**6. PWA Not Installing**
- Manifest must be served over HTTPS
- Check manifest.json path in index.html
- Service worker must be in public folder

---

## Chapter 9: Interview Talking Points

### Technical Decisions

**Why PostgreSQL over MongoDB?**
- Relational data (users → resources, problems → comments)
- ACID transactions for data integrity
- Better for complex queries with JOINs

**Why Prisma over raw SQL?**
- Type-safe database queries
- Auto-generated TypeScript types
- Easy migrations with `prisma migrate`

**Why JWT over sessions?**
- Stateless authentication (no server-side session storage)
- Scalable across multiple servers
- Works well with mobile apps

**Why Vite over Create React App?**
- 10-100x faster build times
- Better dev experience with HMR
- Smaller bundle sizes

### Architecture Highlights

- **Separation of Concerns:** Frontend and backend are independent
- **RESTful API:** Clear endpoint structure (/api/resource)
- **Middleware Pattern:** Reusable authentication logic
- **Component Reusability:** Sidebar, BottomNav, ResizableDivider
- **Responsive Design:** Mobile-first with useIsMobile hook
- **PWA:** Offline-capable, installable

### Features Implemented

1. **Authentication:** JWT-based with password reset via email
2. **News Aggregation:** RSS parsing with cron jobs
3. **CRUD Operations:** Resources, problems, comments, likes
4. **Search & Filter:** News by source/tag, resources by category
5. **Community:** Public sharing, comments, likes
6. **User Profile:** Avatar upload (base64), username change
7. **Theme Toggle:** Dark/light mode with CSS variables
8. **PWA:** Service worker, manifest, installable

### Challenges Overcome

- **CORS Issues:** Configured backend to accept frontend origin
- **JWT Field Mismatch:** Fixed `req.user.id` vs `req.user.userId`
- **Mobile Responsiveness:** Built separate navigation for mobile
- **Database Migrations:** Learned Prisma migration workflow
- **Deployment:** Configured Render for backend, GitHub Pages for frontend

---

## Conclusion

This guide covers the complete development process from setup to deployment. The project demonstrates fullstack skills with modern technologies and best practices suitable for a Duales Studium application.

**Key Takeaways:**
- Fullstack development with React + Node.js
- Database design with Prisma ORM
- RESTful API architecture
- Authentication with JWT
- Responsive design with mobile support
- PWA capabilities
- Deployment to production (Render + GitHub Pages)

Good luck with your application! 🚀
