import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import newsRoutes from "./routes/news.js";
import resourcesRoutes from "./routes/resources.js";
import problemsRoutes from "./routes/problems.js";
import { initializeNewsCron, syncNewsFeeds } from "./services/newsService.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    }),
);
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/resources", resourcesRoutes);
app.use("/api/problems", problemsRoutes);

app.use("/api/dashboard", (req, res) => {
    res.json({ message: "Dashboard routes placeholder" });
});

// Health check
app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);

    // Initialize news cron job (every 2 hours)
    initializeNewsCron();

    // Run initial sync on startup
    syncNewsFeeds().catch((err) => {
        console.error("Initial news sync failed:", err);
    });
});
