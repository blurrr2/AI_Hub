import express from "express";
import prisma from "@prisma/client";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();
const prismaClient = new prisma.PrismaClient();

// PATCH /api/problems/:id/visibility - Toggle public/private
router.patch("/:id/visibility", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const problemId = parseInt(req.params.id);
        const { isPublic } = req.body;

        const problem = await prismaClient.codingProblem.findUnique({
            where: { id: problemId },
        });

        if (!problem) {
            return res.status(404).json({ error: "Problem not found" });
        }

        if (problem.userId !== userId) {
            return res.status(403).json({ error: "Unauthorized" });
        }

        const updated = await prismaClient.codingProblem.update({
            where: { id: problemId },
            data: { isPublic },
        });

        res.json(updated);
    } catch (err) {
        console.error("Error updating visibility:", err);
        res.status(500).json({ error: "Failed to update visibility" });
    }
});

// GET /api/community - Get all public entries
router.get("/", async (req, res) => {
    try {
        const problems = await prismaClient.codingProblem.findMany({
            where: { isPublic: true },
            include: {
                user: { select: { username: true } },
                _count: { select: { likes: true, comments: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        res.json(problems);
    } catch (err) {
        console.error("Error fetching community entries:", err);
        res.status(500).json({ error: "Failed to fetch community entries" });
    }
});

// POST /api/problems/:id/like - Like a problem
router.post("/:id/like", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const problemId = parseInt(req.params.id);

        const problem = await prismaClient.codingProblem.findUnique({
            where: { id: problemId },
        });

        if (!problem || !problem.isPublic) {
            return res.status(404).json({ error: "Public problem not found" });
        }

        const existingLike = await prismaClient.like.findUnique({
            where: { userId_problemId: { userId, problemId } },
        });

        if (existingLike) {
            await prismaClient.like.delete({
                where: { id: existingLike.id },
            });
            res.json({ liked: false });
        } else {
            await prismaClient.like.create({
                data: { userId, problemId },
            });
            res.json({ liked: true });
        }
    } catch (err) {
        console.error("Error toggling like:", err);
        res.status(500).json({ error: "Failed to toggle like" });
    }
});

// GET /api/problems/:id/comments - Get comments for a problem
router.get("/:id/comments", authenticateToken, async (req, res) => {
    try {
        const problemId = parseInt(req.params.id);

        const problem = await prismaClient.codingProblem.findUnique({
            where: { id: problemId },
        });

        if (!problem || !problem.isPublic) {
            return res.status(404).json({ error: "Public problem not found" });
        }

        const comments = await prismaClient.comment.findMany({
            where: { problemId },
            include: { user: { select: { username: true } } },
            orderBy: { createdAt: "asc" },
        });

        res.json(comments);
    } catch (err) {
        console.error("Error fetching comments:", err);
        res.status(500).json({ error: "Failed to fetch comments" });
    }
});

// POST /api/problems/:id/comments - Add a comment
router.post("/:id/comments", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const problemId = parseInt(req.params.id);
        const { content } = req.body;

        if (!content || content.trim() === "") {
            return res.status(400).json({ error: "Comment content required" });
        }

        const problem = await prismaClient.codingProblem.findUnique({
            where: { id: problemId },
        });

        if (!problem || !problem.isPublic) {
            return res.status(404).json({ error: "Public problem not found" });
        }

        const comment = await prismaClient.comment.create({
            data: { userId, problemId, content },
            include: { user: { select: { username: true } } },
        });

        res.status(201).json(comment);
    } catch (err) {
        console.error("Error creating comment:", err);
        res.status(500).json({ error: "Failed to create comment" });
    }
});

export default router;
