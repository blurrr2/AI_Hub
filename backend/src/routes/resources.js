import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateToken } from "../middleware/auth.js";
import { scrapeUrl } from "../services/scrapeService.js";

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/resources/community/all
 * Return all public resources from all users, sorted by rating desc
 * Must come before GET /:id to avoid route conflicts
 */
router.get("/community/all", async (req, res) => {
    try {
        const { category, type, lang, search } = req.query;

        const where = { visibility: "public" };

        if (category) {
            where.category = category;
        }
        if (type) {
            where.type = type;
        }
        if (lang) {
            where.language = lang;
        }
        if (search) {
            where.title = {
                contains: search,
                mode: "insensitive",
            };
        }

        const resources = await prisma.codingResource.findMany({
            where,
            include: {
                user: {
                    select: { id: true, username: true },
                },
            },
            orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
        });

        res.json(resources);
    } catch (err) {
        console.error("Error fetching community resources:", err);
        res.status(500).json({ error: "Failed to fetch community resources" });
    }
});

/**
 * POST /api/resources/scrape
 * Scrape URL for title and type detection
 * Body: {url}
 * Must come before POST / to match specific route
 */
router.post("/scrape", authenticateToken, async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ error: "URL is required" });
        }

        const metadata = await scrapeUrl(url);
        res.json(metadata);
    } catch (err) {
        console.error("Error scraping URL:", err);
        res.status(500).json({ error: "Failed to scrape URL" });
    }
});

/**
 * GET /api/resources
 * Return all resources for logged-in user with filters
 * Query params: category, type, lang, progress, search
 */
router.get("/", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { category, type, lang, progress, search } = req.query;

        const where = { userId };

        if (category) {
            where.category = category;
        }
        if (type) {
            where.type = type;
        }
        if (lang) {
            where.language = lang;
        }
        if (progress !== undefined) {
            where.progress = parseInt(progress);
        }
        if (search) {
            where.title = {
                contains: search,
                mode: "insensitive",
            };
        }

        const resources = await prisma.codingResource.findMany({
            where,
            orderBy: { createdAt: "desc" },
        });

        res.json(resources);
    } catch (err) {
        console.error("Error fetching resources:", err);
        res.status(500).json({ error: "Failed to fetch resources" });
    }
});

/**
 * POST /api/resources
 * Create new resource
 * Body: {title, url, type, category, language, reason}
 */
router.post("/", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { title, url, type, category, language, reason } = req.body;

        if (!title || !url || !type || !category || !language) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const resource = await prisma.codingResource.create({
            data: {
                userId,
                title,
                url,
                type,
                category,
                language,
                reason: reason || null,
                progress: 0,
                rating: 0,
                visibility: "private",
            },
        });

        res.status(201).json(resource);
    } catch (err) {
        console.error("Error creating resource:", err);
        res.status(500).json({ error: "Failed to create resource" });
    }
});

/**
 * PUT /api/resources/:id
 * Update resource (progress, rating, reason)
 */
router.put("/:id", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const resourceId = parseInt(req.params.id);
        const { progress, rating, reason } = req.body;

        // Check ownership
        const resource = await prisma.codingResource.findUnique({
            where: { id: resourceId },
        });

        if (!resource) {
            return res.status(404).json({ error: "Resource not found" });
        }

        if (resource.userId !== userId) {
            return res.status(403).json({ error: "Unauthorized" });
        }

        const updateData = {};
        if (progress !== undefined)
            updateData.progress = Math.min(100, Math.max(0, progress));
        if (rating !== undefined)
            updateData.rating = Math.min(5, Math.max(0, rating));
        if (reason !== undefined) updateData.reason = reason;

        const updated = await prisma.codingResource.update({
            where: { id: resourceId },
            data: updateData,
        });

        res.json(updated);
    } catch (err) {
        console.error("Error updating resource:", err);
        res.status(500).json({ error: "Failed to update resource" });
    }
});

/**
 * DELETE /api/resources/:id
 * Delete resource (only owner can delete)
 */
router.delete("/:id", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const resourceId = parseInt(req.params.id);

        // Check ownership
        const resource = await prisma.codingResource.findUnique({
            where: { id: resourceId },
        });

        if (!resource) {
            return res.status(404).json({ error: "Resource not found" });
        }

        if (resource.userId !== userId) {
            return res.status(403).json({ error: "Unauthorized" });
        }

        await prisma.codingResource.delete({
            where: { id: resourceId },
        });

        res.json({ message: "Resource deleted" });
    } catch (err) {
        console.error("Error deleting resource:", err);
        res.status(500).json({ error: "Failed to delete resource" });
    }
});

export default router;
