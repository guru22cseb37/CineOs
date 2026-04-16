import { Router, Request, Response, NextFunction } from 'express';
import { TMDBService } from '../services/tmdb.service';
import { GroqService } from '../services/groq.service';

const router = Router();

// GET /api/movies/trending
router.get('/trending', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await TMDBService.getTrendingMovies();
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// GET /api/movies/popular
router.get('/popular', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const data = await TMDBService.getPopularMovies(page);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// GET /api/movies/discover
router.get('/discover', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await TMDBService.discoverMovies(req.query as any);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// GET /api/movies/:id/videos
router.get('/:id/videos', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await TMDBService.getMovieVideos(req.params.id);
    res.json(data);
  } catch (error) {
    next(error);
  }
});


// GET /api/movies/:id/dna
// Accepts optional body { title, overview } to speed up and reduce TMDB calls
router.post('/:id/dna', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    let { title, overview } = req.body;

    if (!title || !overview) {
      const movie = await TMDBService.getMovie(id);
      title = movie.title;
      overview = movie.overview;
    }

    const dna = await GroqService.getMovieCineDNA(title, overview);
    res.json(dna);
  } catch (error) {
    next(error);
  }
});

// Legacy GET support
router.get('/:id/dna', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const movie = await TMDBService.getMovie(id);
    const dna = await GroqService.getMovieCineDNA(movie.title, movie.overview);
    res.json(dna);
  } catch (error) {
    next(error);
  }
});

// GET /api/movies/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    // Parallel fetch core data from TMDB
    const [movie, credits, similar] = await Promise.all([
      TMDBService.getMovie(id),
      TMDBService.getMovieCredits(id),
      TMDBService.getMovieSimilar(id)
    ]);

    res.json({ ...movie, credits, similar });
  } catch (error) {
    next(error);
  }
});


export default router;
