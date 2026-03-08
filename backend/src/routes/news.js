import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateToken } from "../middleware/auth.js";
import { syncNewsFeeds } from "../services/newsService.js";

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/news
 * Return paginated news articles with filters
 * Query params: region (world/de/all), tag, search (title search), page, limit=20
 */
router.get("/", async (req, res) => {
    try {
        const { region = "all", tag, search, page = 1, limit = 20 } = req.query;

        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
        const skip = (pageNum - 1) * limitNum;

        // Build filter conditions
        const where = {};

        if (region !== "all") {
            where.region = region;
        }

        if (tag) {
            where.tag = tag;
        }

        if (search) {
            where.title = {
                contains: search,
                mode: "insensitive",
            };
        }

        // Get total count for pagination
        const total = await prisma.newsArticle.count({ where });

        // Fetch articles
        const articles = await prisma.newsArticle.findMany({
            where,
            orderBy: { publishedAt: "desc" },
            skip,
            take: limitNum,
        });

        res.json({
            data: articles,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum),
            },
        });
    } catch (err) {
        console.error("Error fetching news:", err);
        res.status(500).json({ error: "Failed to fetch news articles" });
    }
});

/**
 * POST /api/news/sync
 * Manually trigger RSS feed sync
 * Returns count of new articles added
 */
router.post("/sync", async (req, res) => {
    try {
        const count = await syncNewsFeeds();
        res.json({
            message: "News sync completed",
            articlesAdded: count,
        });
    } catch (err) {
        console.error("Error syncing news:", err);
        res.status(500).json({ error: "Failed to sync news feeds" });
    }
});

/**
 * POST /api/news/:id/bookmark
 * Toggle bookmark for logged-in user (requires JWT auth)
 */
router.post("/:id/bookmark", authenticateToken, async (req, res) => {
    try {
        const articleId = parseInt(req.params.id);
        const userId = req.user.id;

        // Check if article exists
        const article = await prisma.newsArticle.findUnique({
            where: { id: articleId },
        });

        if (!article) {
            return res.status(404).json({ error: "Article not found" });
        }

        // Check if already bookmarked
        const existing = await prisma.bookmarkedArticle.findUnique({
            where: {
                userId_articleId: {
                    userId,
                    articleId,
                },
            },
        });

        if (existing) {
            // Remove bookmark
            await prisma.bookmarkedArticle.delete({
                where: {
                    userId_articleId: {
                        userId,
                        articleId,
                    },
                },
            });
            res.json({ message: "Bookmark removed", bookmarked: false });
        } else {
            // Add bookmark
            await prisma.bookmarkedArticle.create({
                data: {
                    userId,
                    articleId,
                },
            });
            res.json({ message: "Bookmark added", bookmarked: true });
        }
    } catch (err) {
        console.error("Error toggling bookmark:", err);
        res.status(500).json({ error: "Failed to toggle bookmark" });
    }
});

/**
 * GET /api/news/bookmarks
 * Return all bookmarked articles for logged-in user
 */
router.get("/bookmarks", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 20 } = req.query;

        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
        const skip = (pageNum - 1) * limitNum;

        // Get total count
        const total = await prisma.bookmarkedArticle.count({
            where: { userId },
        });

        // Fetch bookmarked articles
        const bookmarks = await prisma.bookmarkedArticle.findMany({
            where: { userId },
            include: {
                article: true,
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limitNum,
        });

        res.json({
            data: bookmarks.map((b) => ({
                id: b.id,
                bookmarkedAt: b.createdAt,
                ...b.article,
            })),
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum),
            },
        });
    } catch (err) {
        console.error("Error fetching bookmarks:", err);
        res.status(500).json({ error: "Failed to fetch bookmarked articles" });
    }
});

export default router;
