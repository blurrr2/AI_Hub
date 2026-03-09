import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";

const router = express.Router();
const prisma = new PrismaClient();

// POST /register
router.post("/register", async (req, res) => {
    try {
        const { email, username, password } = req.body;

        // Validate input
        if (!email || !username || !password) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ email }, { username }],
            },
        });

        if (existingUser) {
            return res
                .status(400)
                .json({ error: "Email or username already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                username,
                password: hashedPassword,
            },
        });

        // Generate token
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
            expiresIn: "24h",
        });

        res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Registration failed" });
    }
});

// POST /login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res
                .status(400)
                .json({ error: "Email and password are required" });
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Generate token
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
            expiresIn: "24h",
        });

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Login failed" });
    }
});

// POST /forgot-password
router.post("/forgot-password", async (req, res) => {
    try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const { email } = req.body;

        // Validate input
        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            // Don't reveal if user exists (security best practice)
            return res.json({
                message: "If this email exists, a reset link was sent.",
            });
        }

        // Generate reset token (32 bytes = 64 hex chars)
        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        // Save token to database
        await prisma.user.update({
            where: { email },
            data: {
                resetToken,
                resetTokenExpiry,
            },
        });

        res.json({
            message: "Reset token generated! Proceed to reset your password.",
            token: resetToken,
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /reset-password
router.post("/reset-password", async (req, res) => {
    try {
        const { token, password, confirmPassword } = req.body;

        // Validate input
        if (!token || !password) {
            return res
                .status(400)
                .json({ error: "Token and password are required" });
        }

        if (password !== confirmPassword) {
            return res
                .status(400)
                .json({ error: "Passwords do not match" });
        }

        // Find user with valid reset token
        const user = await prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: {
                    gt: new Date(), // Token must not be expired
                },
            },
        });

        if (!user) {
            return res.status(400).json({
                error: "Invalid or expired reset token",
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update password and clear reset token
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null,
            },
        });

        res.json({
            message: "Password reset successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Password reset failed" });
    }
});

export default router;
