import express from "express";
import prisma from "@prisma/client";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();
const prismaClient = new prisma.PrismaClient();

/**
 * GET /api/problems
 * Get all problems for logged-in user with filters
 */
router.get("/", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { type, status, lang, search } = req.query;

        const where = {
            userId,
        };

        if (type) where.type = type;
        if (status) where.status = status;
        if (lang) where.language = lang;
        if (search) {
            where.OR = [
                { title: { contains: search, mode: "insensitive" } },
                { tag: { contains: search, mode: "insensitive" } },
            ];
        }

        const problems = await prismaClient.codingProblem.findMany({
            where,
            orderBy: { createdAt: "desc" },
        });

        res.json(problems);
    } catch (err) {
        console.error("Error fetching problems:", err);
        res.status(500).json({ error: "Failed to fetch problems" });
    }
});

/**
 * POST /api/problems
 * Create new problem entry
 */
router.post("/", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { type, title, lang, tag, status, problem, solution, learned } =
            req.body;

        // Validation
        if (!type || !title || !lang || !status) {
            return res
                .status(400)
                .json({
                    error: "Missing required fields: type, title, lang, status",
                });
        }

        const validTypes = ["bug", "solution", "note", "challenge"];
        if (!validTypes.includes(type)) {
            return res
                .status(400)
                .json({
                    error: "Invalid type. Must be: bug, solution, note, challenge",
                });
        }

        const validStatuses = ["Open", "Solved", "Learning", "Done"];
        if (!validStatuses.includes(status)) {
            return res
                .status(400)
                .json({
                    error: "Invalid status. Must be: Open, Solved, Learning, Done",
                });
        }

        const entry = await prismaClient.codingProblem.create({
            data: {
                userId,
                type,
                title,
                language: lang,
                tag: tag || "",
                status,
                problem: problem || "",
                solution: solution || "",
                learned: learned || "",
                createdAt: new Date(),
            },
        });

        res.status(201).json(entry);
    } catch (err) {
        console.error("Error creating problem:", err);
        res.status(500).json({ error: "Failed to create problem entry" });
    }
});

/**
 * PUT /api/problems/:id
 * Update problem entry
 */
router.put("/:id", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const problemId = parseInt(req.params.id);
        const { type, title, lang, tag, status, problem, solution, learned } =
            req.body;

        // Check ownership
        const entry = await prismaClient.codingProblem.findUnique({
            where: { id: problemId },
        });

        if (!entry) {
            return res.status(404).json({ error: "Problem entry not found" });
        }

        if (entry.userId !== userId) {
            return res.status(403).json({ error: "Unauthorized" });
        }

        // Validate enum values if provided
        if (type) {
            const validTypes = ["bug", "solution", "note", "challenge"];
            if (!validTypes.includes(type)) {
                return res
                    .status(400)
                    .json({
                        error: "Invalid type. Must be: bug, solution, note, challenge",
                    });
            }
        }

        if (status) {
            const validStatuses = ["Open", "Solved", "Learning", "Done"];
            if (!validStatuses.includes(status)) {
                return res
                    .status(400)
                    .json({
                        error: "Invalid status. Must be: Open, Solved, Learning, Done",
                    });
            }
        }

        const updateData = {};
        if (type !== undefined) updateData.type = type;
        if (title !== undefined) updateData.title = title;
        if (lang !== undefined) updateData.language = lang;
        if (tag !== undefined) updateData.tag = tag;
        if (status !== undefined) updateData.status = status;
        if (problem !== undefined) updateData.problem = problem;
        if (solution !== undefined) updateData.solution = solution;
        if (learned !== undefined) updateData.learned = learned;

        const updated = await prismaClient.codingProblem.update({
            where: { id: problemId },
            data: updateData,
        });

        res.json(updated);
    } catch (err) {
        console.error("Error updating problem:", err);
        res.status(500).json({ error: "Failed to update problem entry" });
    }
});

/**
 * DELETE /api/problems/:id
 * Delete problem entry
 */
router.delete("/:id", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const problemId = parseInt(req.params.id);

        // Check ownership
        const entry = await prismaClient.codingProblem.findUnique({
            where: { id: problemId },
        });

        if (!entry) {
            return res.status(404).json({ error: "Problem entry not found" });
        }

        if (entry.userId !== userId) {
            return res.status(403).json({ error: "Unauthorized" });
        }

        await prismaClient.codingProblem.delete({
            where: { id: problemId },
        });

        res.json({ success: true });
    } catch (err) {
        console.error("Error deleting problem:", err);
        res.status(500).json({ error: "Failed to delete problem entry" });
    }
});

export default router;
