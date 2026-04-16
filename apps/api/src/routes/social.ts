import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { User } from '../models/User';
import mongoose from 'mongoose';

const router = Router();
router.use(authenticate);

// Find users by name or email
router.get('/search', async (req: AuthRequest, res, next) => {
  try {
    const { query } = req.query;
    if (!query) return res.json([]);

    const users = await User.find({
      $or: [
        { name: { $regex: query as string, $options: 'i' } },
        { email: { $regex: query as string, $options: 'i' } }
      ],
      _id: { $ne: req.user!.id }
    }).select('name avatar email').limit(10);

    res.json(users);
  } catch (error) {
    next(error);
  }
});

// Calculate compatibility between current user and another user
router.get('/compatibility/:userId', async (req: AuthRequest, res, next) => {
  try {
    const targetUserId = req.params.userId;
    const currentUserId = req.user!.id;

    // In a real app, we'd fetch actual DNA. For this MVP, we simulate compatibility
    // based on genre overlap or a shared seed to ensure it's "real enough"
    const [user1, user2] = await Promise.all([
      User.findById(currentUserId),
      User.findById(targetUserId)
    ]);

    if (!user1 || !user2) return res.status(404).json({ error: 'User not found' });

    // Dummy logic for match % based on shared movie IDs
    const sharedMovies = user1.watchHistory.filter(h1 => 
      user2.watchHistory.some(h2 => h2.movieId === h1.movieId)
    ).length;

    const compatibility = Math.min(65 + (sharedMovies * 5), 99); // Base 65% match

    res.json({
      score: compatibility,
      commonMovies: sharedMovies
    });
  } catch (error) {
    next(error);
  }
});

// Send friend request
router.post('/request/:userId', async (req: AuthRequest, res, next) => {
  try {
    const targetId = new mongoose.Types.ObjectId(req.params.userId);
    const user = await User.findById(targetId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (!user.friendRequests.includes(new mongoose.Types.ObjectId(req.user!.id))) {
      user.friendRequests.push(new mongoose.Types.ObjectId(req.user!.id));
      await user.save();
    }

    res.json({ message: 'Request sent' });
  } catch (error) {
    next(error);
  }
});

export default router;
