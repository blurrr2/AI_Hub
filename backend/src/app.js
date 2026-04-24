import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import newsRoutes from "./routes/news.js";
import resourcesRoutes from "./routes/resources.js";
import problemsRoutes from "./routes/problems.js";
import dashboardRoutes from "./routes/dashboard.js";
import communityRoutes from "./routes/community.js";
import userRoutes from "./routes/user.js";

const app = express();

// Middleware
app.use(
    cors({
        origin: true,
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    }),
);
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/resources", resourcesRoutes);
app.use("/api/problems", problemsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/user", userRoutes);

export default app;
