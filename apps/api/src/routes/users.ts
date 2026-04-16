import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { User } from '../models/User';
import { Interaction } from '../models/Interaction';

const router = Router();

// Apply auth middleware to all user routes
router.use(authenticate);

// Get current user profile
router.get('/me', async (req: AuthRequest, res, next) => {
  try {
    const user = await User.findById(req.user!.id).select('-passwordHash');
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Post an interaction (like/dislike/view)
router.post('/interactions', async (req: AuthRequest, res, next) => {
  try {
    const { movieId, type } = req.body;
    
    if (!movieId || !type) {
      return res.status(400).json({ error: 'movieId and type are required' });
    }

    const interaction = new Interaction({
      userId: req.user!.id,
      movieId,
      type
    });

    await interaction.save();
    res.status(201).json({ message: 'Interaction recorded', interaction });
  } catch (error) {
    next(error);
  }
});

// Toggle watchlist
router.post('/watchlist/:movieId', async (req: AuthRequest, res, next) => {
  try {
    const movieId = parseInt(req.params.movieId);
    const { title, poster, rating } = req.body;

    const user = await User.findById(req.user!.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const exists = user.watchlist.find(w => w.movieId === movieId);
    
    if (exists) {
      // Remove from watchlist
      user.watchlist = user.watchlist.filter(w => w.movieId !== movieId);
      await user.save();
      return res.json({ message: 'Removed from watchlist', action: 'removed' });
    } else {
      // Add to watchlist
      user.watchlist.push({ movieId, title, poster, rating, addedAt: new Date() });
      await user.save();
      return res.json({ message: 'Added to watchlist', action: 'added' });
    }
  } catch (error) {
    next(error);
  }
});

export default router;
