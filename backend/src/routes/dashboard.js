import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/dashboard/stats - returns user dashboard statistics
router.get("/stats", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        // Count bookmarked articles (news read)
        const newsReadCount = await prisma.bookmarkedArticle.count({
            where: { userId },
        });

        // Count user's resources
        const resourcesCount = await prisma.codingResource.count({
            where: { userId },
        });

        // Count user's solved problems (status = "Solved")
        const bugsSolvedCount = await prisma.codingProblem.count({
            where: {
                userId,
                status: "Solved",
            },
        });

        // Calculate streak (consecutive days with activity)
        const activities = await prisma.userActivity.findMany({
            where: { userId },
            orderBy: { date: "desc" },
            take: 365,
        });

        let streak = 0;
        if (activities.length > 0) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            for (let i = 0; i < activities.length; i++) {
                const actDate = new Date(activities[i].date);
                actDate.setHours(0, 0, 0, 0);

                const expectedDate = new Date(today);
                expectedDate.setDate(expectedDate.getDate() - i);

                if (actDate.getTime() === expectedDate.getTime()) {
                    streak++;
                } else {
                    break;
                }
            }
        }

        res.json({
            newsRead: newsReadCount,
            resources: resourcesCount,
            bugsSolved: bugsSolvedCount,
            papers: 0, // Not tracked yet
            streak,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
});

// GET /api/dashboard/activity - returns recent user activities
router.get("/activity", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        const activities = await prisma.userActivity.findMany({
            where: { userId },
            orderBy: { date: "desc" },
            take: 5,
        });

        const formattedActivities = activities.map((activity) => ({
            type: activity.type,
            description: `${activity.type} - ${activity.count} time(s)`,
            createdAt: activity.date,
        }));

        res.json(formattedActivities);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch activities" });
    }
});

export default router;
