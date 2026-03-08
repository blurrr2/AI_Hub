# AI Hub — Complete Development Guide 🚀
**VS Code + Claude Code · React + Node.js · Dark/Light Theme Toggle**
*Duales Studium Informatik Application Project*

---

## Table of Contents
1. [Chapter 0: Install Tools](#chapter-0-install-tools)
2. [Chapter 1: Project Structure](#chapter-1-create-project-structure)
3. [Chapter 2: Database Design](#chapter-2-database-design-prisma-schema)
4. [Chapter 3: Backend Development](#chapter-3-backend-development-nodejs--express)
5. [Chapter 4: Dark/Light Theme Toggle](#chapter-4-darklight-theme-toggle)
6. [Chapter 5: How to Use Claude Code](#chapter-5-how-to-use-claude-code)
7. [Chapter 6: 8-Week Development Plan](#chapter-6-8-week-development-plan)
8. [Chapter 7: Deployment (Free!)](#chapter-7-deployment-free)
9. [Chapter 8: Writing the README](#chapter-8-writing-the-readmemd)
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
mkdir ai-hub
cd ai-hub
mkdir frontend backend
```

### 1.2 Initialize Backend

```bash
cd backend
npm init -y

# Install all backend dependencies at once
npm install express cors dotenv jsonwebtoken bcrypt
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
npm install react-router-dom axios zustand
npm install react-syntax-highlighter react-calendar-heatmap

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 1.4 Final Folder Structure

```
ai-hub/
├── frontend/
│   ├── src/
│   │   ├── components/     ← Reusable UI components (buttons, cards, etc.)
│   │   ├── pages/          ← Page components (Dashboard, News, Library...)
│   │   ├── hooks/          ← Custom React Hooks
│   │   ├── api/            ← All API call functions
│   │   ├── store/          ← Zustand global state
│   │   ├── context/        ← Theme Context (theme switching)
│   │   └── App.tsx         ← Root component, routing lives here
│   └── index.html
├── backend/
│   ├── src/
│   │   ├── routes/         ← API routes (/api/news, /api/resources...)
│   │   ├── controllers/    ← Business logic
│   │   ├── middleware/     ← JWT verification, error handling
│   │   ├── services/       ← RSS fetching, cron jobs
│   │   └── app.js          ← Express entry point
│   ├── prisma/
│   │   └── schema.prisma   ← Database schema definition
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
  createdAt  DateTime         @default(now())
  resources  Resource[]
  problems   CodingProblem[]
  activities UserActivity[]
}

// News articles table
model NewsArticle {
  id          Int      @id @default(autoincrement())
  title       String
  url         String   @unique
  source      String
  category    String
  region      String   @default("world")
  publishedAt DateTime
  createdAt   DateTime @default(now())
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
  language   String   @default("EN")
  rating     Int      @default(0)
  progress   Int      @default(0)
  reason     String?
  visibility String   @default("private")
  createdAt  DateTime @default(now())
}

// Coding Journal entries table
model CodingProblem {
  id        Int      @id @default(autoincrement())
  userId    Int
  user      User     @relation(fields: [userId], references: [id])
  type      String
  title     String
  language  String
  tag       String
  status    String   @default("open")
  problem   String?
  solution  String?
  learned   String?
  createdAt DateTime @default(now())
}

// Daily activity log (for heatmap)
model UserActivity {
  id     Int      @id @default(autoincrement())
  userId Int
  user   User     @relation(fields: [userId], references: [id])
  date   DateTime @default(now())
  type   String
  count  Int      @default(1)
  @@unique([userId, date, type])
}
```

### Run Database Migration

```bash
# First set database connection in .env:
# DATABASE_URL="postgresql://username:password@localhost:5432/aihub"

cd backend
npx prisma migrate dev --name init
npx prisma generate
```

> ✅ You'll see `Generated Prisma Client` on success. All database tables are created automatically.

---

## Chapter 3: Backend Development (Node.js + Express)

### 3.1 Create Entry File

```javascript
// backend/src/app.js
const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Routes
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/news',      require('./routes/news'));
app.use('/api/resources', require('./routes/resources'));
app.use('/api/problems',  require('./routes/problems'));
app.use('/api/dashboard', require('./routes/dashboard'));

app.listen(3001, () => console.log('Server running on :3001'));
```

### 3.2 Use Claude Code to Generate Routes (Key Step!)

Open terminal in the backend folder, type `claude`, then tell it what you need:

```
"Write src/routes/auth.js with POST /register and POST /login routes.
 Use bcrypt to hash passwords, JWT to generate tokens, connect to Prisma database."
```

> 💡 Claude Code creates the files directly in your folder — no copy-pasting needed!

### 3.3 RSS News Auto-Fetching

```
"Write an RSS news auto-fetch service. Run every 2 hours, fetch from:
 OpenAI Blog, HuggingFace, DeepMind, Heise Online, t3n.de.
 Use node-cron for scheduling, rss-parser to parse feeds,
 save to Prisma database, skip URLs that already exist."
```

### 3.4 Start the Backend Server

```json
// Add to backend/package.json scripts:
{
  "scripts": {
    "dev": "nodemon src/app.js",
    "start": "node src/app.js"
  }
}
```

```bash
npm run dev
# "Server running on :3001" means it's working!
```

---

## Chapter 4: Dark/Light Theme Toggle

Using React Context + CSS Variables. Switching themes only requires changing one class on `<html>`.

### 4.1 Create Theme Context

```typescript
// frontend/src/context/ThemeContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
}>({ theme: 'light', toggleTheme: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Remember user's last preference
    return (localStorage.getItem('theme') as Theme) || 'light';
  });

  useEffect(() => {
    // Add class to <html> tag to control all colors globally
    document.documentElement.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme(t => t === 'light' ? 'dark' : 'light');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Use in any component like this:
export const useTheme = () => useContext(ThemeContext);
```

### 4.2 CSS Variables (Light + Dark)

```css
/* frontend/src/index.css */

/* Light theme (default) */
:root, html.light {
  --bg:       #f7f5f0;
  --surface:  #ffffff;
  --surface2: #f0ece4;
  --border:   #e2ddd6;
  --ink:      #1a1612;
  --ink2:     #4a4540;
  --ink3:     #8a847e;
  --accent:   #c8401a;
  --sidebar:  #0f1117;
}

/* Dark theme */
html.dark {
  --bg:       #0d1117;
  --surface:  #161b27;
  --surface2: #1e2535;
  --border:   #2a3045;
  --ink:      #e2e8f0;
  --ink2:     #94a3b8;
  --ink3:     #64748b;
  --accent:   #f87171;
  --sidebar:  #0a0e1a;
}

/* All components use variables — never hardcode colors */
.card { background: var(--surface); border: 1px solid var(--border); }
.page { background: var(--bg); color: var(--ink); }
```

### 4.3 Theme Toggle Button Component

```typescript
// frontend/src/components/ThemeToggle.tsx
import { useTheme } from '../context/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button onClick={toggleTheme}
      style={{
        background: 'var(--surface2)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '6px 12px',
        cursor: 'pointer',
        color: 'var(--ink)',
        fontSize: 14
      }}>
      {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
    </button>
  );
}
```

### 4.4 Wrap App.tsx with ThemeProvider

```typescript
// frontend/src/App.tsx
import { ThemeProvider } from './context/ThemeContext';
import { ThemeToggle } from './components/ThemeToggle';

function App() {
  return (
    <ThemeProvider>
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <ThemeToggle />
        {/* Other page content */}
      </div>
    </ThemeProvider>
  );
}
```

> 💡 Theme persists on page refresh because localStorage saves the user's choice.

---

## Chapter 5: How to Use Claude Code

### 5.1 Daily Development Workflow

| Step | What You Do | How |
|------|-------------|-----|
| 1. Open project | Open ai-hub folder in VS Code | File → Open Folder |
| 2. Start backend | Run backend server in terminal | `cd backend → npm run dev` |
| 3. Start frontend | Run frontend in another terminal | `cd frontend → npm run dev` |
| 4. Start Claude Code | Type claude in terminal | `cd ai-hub → claude` |
| 5. Build features | Tell Claude Code what to build | See prompt templates below |
| 6. Test | Test APIs with Thunder Client | Open in VS Code sidebar |
| 7. Save progress | Commit with Git | `git add . → git commit -m 'feat: xxx'` |

### 5.2 Prompt Templates for Claude Code

**Writing a new feature:**
```
"In backend/src/routes/resources.js, write a GET /api/resources route.
 Requires JWT authentication, returns all resources for the logged-in user,
 supports ?category=Python filtering."
```

**Fixing a bug:**
```
"I got this error running npm run dev: [paste error message].
 Here's the file causing it: [paste code]. Please find the cause and fix it."
```

**Writing a React component:**
```
"In frontend/src/pages/Dashboard.tsx, create the Dashboard page.
 Include: 5 stat cards (fetching data from GET /api/dashboard/stats),
 and an activity feed list.
 Use CSS variables for all colors to support dark/light theme."
```

**Adding theme support to existing component:**
```
"In frontend/src/pages/Library.tsx, replace all hardcoded colors
 (like #f7f5f0, #ffffff) with CSS variables (var(--bg), var(--surface), etc.)
 so it supports dark/light theme switching."
```

> ⚠️ Never ask Claude Code to write your `.env` file contents! Fill in secrets manually and never push them to GitHub.

---

## Chapter 6: 8-Week Development Plan

| Phase | Timeline | Tasks | Done When |
|-------|----------|-------|-----------|
| Phase 1: Auth | Week 1 | Install tools, create structure, database setup, Register/Login API, frontend login page | Register/login works, JWT token functions correctly |
| Phase 2: News Feed | Weeks 2-3 | RSS fetching, cron jobs, news API, news page UI, 🇩🇪 German sources | News auto-updates, page filters by category |
| Phase 3: Learning Library | Weeks 4-5 | Resource CRUD API, resource cards, URL auto-detection, tag filtering, progress tracking | Can add/delete/update resources, progress saves |
| Phase 4: Coding Journal | Week 6 | Journal CRUD API, split view editor, language selector, syntax highlighting, tag grouping | Can create bug entries, split view works |
| Phase 5: Dashboard + Theme | Week 7 | Stats API, activity heatmap, charts, dark/light theme toggle | Theme switches smoothly, dashboard shows real data |
| Phase 6: Deploy | Week 8 | GitHub repo, Vercel frontend, Render backend, README (EN + DE) | Live link to share with HR |

---

## Chapter 7: Deployment (Free!)

### 7.1 Push Code to GitHub

```bash
cd ai-hub
git init
git add .
git commit -m "initial commit"

# Create a new repo on github.com, then:
git remote add origin https://github.com/yourusername/ai-hub.git
git push -u origin main
```

> ⚠️ Make sure `.gitignore` includes `.env` and `node_modules` before pushing — otherwise your secrets will be public!

### 7.2 Deploy Backend to Render

1. Go to render.com and sign up (use GitHub login)
2. Click **New → Web Service** → connect your GitHub repo
3. Root Directory: `backend`
4. Build Command: `npm install && npx prisma generate`
5. Start Command: `node src/app.js`
6. Add Environment Variables: `DATABASE_URL` and `JWT_SECRET`
7. Click Deploy, wait 2-3 minutes

> 💡 Render gives you a URL like `https://ai-hub-api.onrender.com`. Add this to your frontend as the API base URL.

### 7.3 Deploy Frontend to Vercel

1. Go to vercel.com and sign up (use GitHub login)
2. Click **New Project** → import your GitHub repo
3. Root Directory: `frontend`
4. Add Environment Variable: `VITE_API_URL = your Render URL`
5. Click Deploy, wait 1 minute

> 💡 You'll get a live link like `https://ai-hub-xxx.vercel.app` — this goes on your resume!

---

## Chapter 8: Writing the README.md

The README is the first thing HR sees when opening your GitHub repository. Write it in both English and German.

### What to Include

- 📸 **Screenshots or GIF demo** (most important!)
- 📝 Short project description (1-2 sentences)
- 🛠️ Tech stack list (React, Node.js, PostgreSQL...)
- ✨ Feature list (News Feed, Library, Journal, Dashboard)
- 🚀 Local setup steps (git clone → npm install → npm run dev)
- 🔗 Live demo link (Vercel URL)
- 🌟 Project highlights (German news sources, Chinese resource support, theme toggle)

### Ask Claude Code to Generate It

```
"Write a README.md for this project in both English and German.
 Include: feature overview, tech stack, local setup instructions, screenshot placeholders.
 Project name: AI Hub, built with React + Node.js + PostgreSQL.
 Highlight: supports German news sources (Heise, t3n, DFKI) and Chinese resources (Bilibili)."
```

---

## Chapter 9: Interview Talking Points

| Question | Your Answer |
|----------|-------------|
| What is this project? | "I built an AI learning tracker that helps developers aggregate AI news, manage learning resources, and log coding problems." |
| Why did you build it? | "When I was learning AI, resources were scattered across YouTube, blogs, and social media. I wanted one unified place to manage everything." |
| Tech stack? | "React + TypeScript frontend, Node.js + Express backend, PostgreSQL + Prisma database, deployed on Vercel and Render." |
| Hardest part? | "Adapting RSS feeds for Chinese content sources. Sites like 机器之心 don't provide standard RSS, so I used RSSHub and cheerio to scrape og:title metadata." |
| German relevance? | "I specifically integrated German AI news sources — Heise Online, t3n.de, DFKI, and golem.de — making it useful for German students and professionals following the local tech landscape." |

---

*Good luck with your Duales Studium application! 🚀*
*Take it one phase at a time. Commit to Git after every phase. When stuck, ask Claude Code.*
