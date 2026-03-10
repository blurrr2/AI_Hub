# AI News & Learning Hub

A full-stack web application for staying updated with AI news, managing learning resources, and tracking coding progress. Built with modern web technologies and featuring a clean, responsive UI with dark/light theme support.

## 🚀 Live Demo

[https://blurrr2.github.io/AI_Hub](https://blurrr2.github.io/AI_Hub)

## 🛠️ Tech Stack

**Frontend:**
- React + TypeScript
- React Router
- Axios
- Vite

**Backend:**
- Node.js + Express
- PostgreSQL + Prisma ORM
- JWT Authentication
- Resend Email Service

## ✨ Features

- **News Feed** - Browse and bookmark AI-related news articles
- **Learning Library** - Manage coding resources and learning materials
- **Coding Journal** - Track daily coding problems and solutions
- **User Authentication** - Secure login/register with JWT
- **Password Reset** - Email-based password recovery
- **Dark/Light Theme** - Toggle between themes for comfortable viewing
- **Activity Dashboard** - Visualize your learning progress

## 📸 Screenshots

_Screenshots coming soon_

## 🏃 Local Setup

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- Resend API key (for email functionality)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with the following variables:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/aihub"
JWT_SECRET="your-secret-key"
RESEND_API_KEY="your-resend-api-key"
```

4. Run database migrations:
```bash
npx prisma migrate dev
npx prisma generate
```

5. Start the development server:
```bash
npm run dev
```

The backend will run on `http://localhost:3000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```env
VITE_API_URL=http://localhost:3000
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### News
- `GET /api/news` - Get all news articles
- `POST /api/news/bookmark` - Bookmark an article
- `DELETE /api/news/bookmark/:id` - Remove bookmark

### Resources
- `GET /api/resources` - Get user's learning resources
- `POST /api/resources` - Add new resource
- `DELETE /api/resources/:id` - Delete resource

### Problems
- `GET /api/problems` - Get user's coding problems
- `POST /api/problems` - Add new problem
- `DELETE /api/problems/:id` - Delete problem

### Dashboard
- `GET /api/dashboard/stats` - Get user activity statistics

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.
