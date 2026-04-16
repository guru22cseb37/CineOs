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

// Add to watch history
router.post('/history', async (req: AuthRequest, res, next) => {
  try {
    const { movieId, rating } = req.body;
    if (!movieId) return res.status(400).json({ error: 'movieId is required' });

    const user = await User.findById(req.user!.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.watchHistory.push({ movieId: parseInt(movieId), watchedAt: new Date(), rating });
    await user.save();

    res.status(201).json({ message: 'Added to history', history: user.watchHistory });
  } catch (error) {
    next(error);
  }
});

// Add a journal entry
router.post('/journal', async (req: AuthRequest, res, next) => {
  try {
    const { movieId, movieTitle, entry, vibe } = req.body;
    if (!movieId || !movieTitle || !entry) {
      return res.status(400).json({ error: 'movieId, movieTitle, and entry are required' });
    }

    const user = await User.findById(req.user!.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.journal.push({ 
      movieId: parseInt(movieId), 
      movieTitle, 
      entry, 
      vibe, 
      createdAt: new Date() 
    });
    await user.save();

    res.status(201).json({ message: 'Journal entry saved', journal: user.journal });
  } catch (error) {
    next(error);
  }
});

// GET /api/users/me/dna
// Aggregates DNA from all movies in history or interactions
router.get('/me/dna', async (req: AuthRequest, res, next) => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Movies from history + likes from interactions
    const movieIds = [...new Set([
      ...user.watchHistory.map(h => h.movieId),
      ...user.watchlist.map(w => w.movieId)
    ])];

    if (movieIds.length === 0) {
      return res.json({
        labels: ['Cinematography', 'Storyweight', 'Adrenaline', 'Heart', 'Complexity'],
        values: [50, 50, 50, 50, 50]
      });
    }

    const { GroqService } = await import('../services/groq.service');
    const { TMDBService } = await import('../services/tmdb.service');

    // Limit to last 10 movies for performance
    const recentMovies = movieIds.slice(-10);
    
    const movieDetails = await Promise.all(
      recentMovies.map(id => TMDBService.getMovie(String(id)))
    );

    const dnaResults = await Promise.all(
      movieDetails.map(m => GroqService.getMovieCineDNA(m.title, m.overview))
    );

    const totalV = [0, 0, 0, 0, 0];
    dnaResults.forEach(dna => {
      dna.values.forEach((v, i) => totalV[i] += v);
    });

    const avgValues = totalV.map(v => Math.round(v / dnaResults.length));

    res.json({
      labels: dnaResults[0]?.labels || ['Cinematography', 'Storyweight', 'Adrenaline', 'Heart', 'Complexity'],
      values: avgValues,
      sampleSize: dnaResults.length
    });
  } catch (error) {
    next(error);
  }
});

export default router;
