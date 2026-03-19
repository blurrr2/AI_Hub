import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/user/profile - Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    console.log('req.user:', req.user); // debug log
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not found in token' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatar: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// PUT /api/user/profile - Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { displayName, avatar } = req.body;
    const userId = req.user?.userId || req.user?.id;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(displayName !== undefined && { displayName }),
        ...(avatar !== undefined && { avatar }),
      },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatar: true,
        createdAt: true,
      },
    });

    res.json({ message: 'Profile updated', user: updatedUser });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// PUT /api/user/password - Change password
router.put('/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.userId || req.user?.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// PUT /api/user/username - Update username
router.put('/username', authenticateToken, async (req, res) => {
  try {
    const { username } = req.body;
    const userId = req.user?.userId || req.user?.id;

    if (!username) {
      return res.status(400).json({ error: 'Username required' });
    }

    // Check if username is already taken
    const existing = await prisma.user.findUnique({
      where: { username },
    });

    if (existing && existing.id !== userId) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { username },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatar: true,
        createdAt: true,
      },
    });

    res.json({ message: 'Username updated', user: updatedUser });
  } catch (error) {
    console.error('Update username error:', error);
    res.status(500).json({ error: 'Failed to update username' });
  }
});

export default router;
