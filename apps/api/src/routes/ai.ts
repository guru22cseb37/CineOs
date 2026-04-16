import { Router, Request, Response, NextFunction } from 'express';
import { TMDBService } from '../services/tmdb.service';

const router = Router();

const GENRE_NAMES: Record<string, string> = {
  '28': 'Action', '35': 'Comedy', '18': 'Drama', '27': 'Horror',
  '10749': 'Romance', '878': 'Sci-Fi', '53': 'Thriller', '16': 'Animation',
  '14': 'Fantasy', '80': 'Crime', '12': 'Adventure', '99': 'Documentary',
};

// POST /api/ai/search — uses TMDB discover as fallback
router.post('/search', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'query is required' });

    // Try Groq AI first, fallback to popularity
    let params: Record<string, string> = { sort_by: 'popularity.desc' };
    try {
      const { GroqService } = await import('../services/groq.service');
      params = await GroqService.naturalLanguageToParams(query);
    } catch (e) {
      console.warn('Groq AI unavailable, using popularity fallback');
    }

    const movies = await TMDBService.discoverMovies(params);
    res.json({ query, params, results: movies.results });
  } catch (error: any) {
    next(error);
  }
});

// POST /api/ai/mood
router.post('/mood', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, overview } = req.body;
    try {
      const { GroqService } = await import('../services/groq.service');
      const mood = await GroqService.getMovieMoodDescription(title, overview);
      res.json({ mood });
    } catch {
      res.json({ mood: '' });
    }
  } catch (error) {
    next(error);
  }
});

// POST /api/ai/watch-party — PURE MATH, no AI needed
router.post('/watch-party', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { profiles } = req.body;
    if (!profiles || profiles.length < 2) {
      return res.status(400).json({ error: 'At least 2 profiles required' });
    }

    // Compute genre overlap mathematically
    const allGenres: number[] = profiles.flatMap((p: any) => p.genres || []);
    const counts: Record<number, number> = {};
    for (const g of allGenres) {
      counts[g] = (counts[g] || 0) + 1;
    }

    // Sort by frequency (shared genres first)
    const sorted = Object.entries(counts)
      .sort((a, b) => Number(b[1]) - Number(a[1]));

    const topGenreIds = sorted.slice(0, 3).map(e => e[0]);
    const genreIds = topGenreIds.join(',') || '28';
    const genreNames = topGenreIds.map(id => GENRE_NAMES[id] || `Genre ${id}`).join(', ');
    const reason = `Based on overlapping tastes across ${profiles.length} people, the best shared genres are: ${genreNames}. Here are top-rated movies everyone should enjoy!`;

    const movies = await TMDBService.discoverMovies({
      with_genres: genreIds,
      sort_by: 'vote_average.desc',
      'vote_average.gte': '7',
      'vote_count.gte': '100'
    });

    res.json({
      reason,
      genres: genreIds,
      recommendations: (movies.results || []).slice(0, 10)
    });
  } catch (error) {
    console.error('Watch party error:', error);
    next(error);
  }
});


// POST /api/ai/critics
router.post('/critics', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, overview } = req.body;
    if (!title || !overview) return res.status(400).json({ error: 'title and overview are required' });

    const { GroqService } = await import('../services/groq.service');
    const reviews = await GroqService.getMovieCritics(title, overview);
    res.json(reviews);
  } catch (error) {
    next(error);
  }
});

// POST /api/ai/vibe-search
router.post('/vibe-search', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { vibe } = req.body;
    if (!vibe) return res.status(400).json({ error: 'vibe is required' });

    const { GroqService } = await import('../services/groq.service');
    const params = await GroqService.translateVibeToParams(vibe);
    const movies = await TMDBService.discoverMovies(params);
    res.json({ vibe, params, results: movies.results });
  } catch (error) {
    next(error);
  }
});

// POST /api/ai/scene-trivia
router.post('/scene-trivia', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { movieTitle, sceneDescription } = req.body;
    if (!movieTitle || !sceneDescription) return res.status(400).json({ error: 'movieTitle and sceneDescription are required' });

    const { GroqService } = await import('../services/groq.service');
    const trivia = await GroqService.getSceneTrivia(movieTitle, sceneDescription);
    res.json({ trivia });
  } catch (error) {
    next(error);
  }
});

// POST /api/ai/director-vision
router.post('/director-vision', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, overview } = req.body;
    if (!title || !overview) return res.status(400).json({ error: 'title and overview are required' });

    const { GroqService } = await import('../services/groq.service');
    const vision = await GroqService.getDirectorVision(title, overview);
    res.json(vision);
  } catch (error) {
    next(error);
  }
});

// POST /api/ai/mood-to-scene
router.post('/mood-to-scene', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, mood } = req.body;
    if (!title || !mood) return res.status(400).json({ error: 'title and mood are required' });

    const { GroqService } = await import('../services/groq.service');
    const scenes = await GroqService.getMoodToScene(title, mood);
    res.json(scenes);
  } catch (error) {
    next(error);
  }
});

export default router;

