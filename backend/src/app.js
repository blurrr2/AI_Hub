import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import newsRoutes from "./routes/news.js";
import resourcesRoutes from "./routes/resources.js";
import problemsRoutes from "./routes/problems.js";

const app = express();

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

export default app;
