import { Router } from 'express';
import { TMDBService } from '../services/tmdb.service';

const router = Router();

// GET /api/movies/trending
router.get('/trending', async (req, res, next) => {
  try {
    const data = await TMDBService.getTrendingMovies();
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// GET /api/movies/popular
router.get('/popular', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const data = await TMDBService.getPopularMovies(page);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// GET /api/movies/discover
router.get('/discover', async (req, res, next) => {
  try {
    const { language, genre, page } = req.query;
    const pageNum = parseInt(page as string) || 1;
    
    let data;
    if (language) {
      data = await TMDBService.discoverMoviesByLanguage(language as string, pageNum);
    } else if (genre) {
      data = await TMDBService.discoverMoviesByGenre(parseInt(genre as string), pageNum);
    } else {
      data = await TMDBService.getPopularMovies(pageNum);
    }
    
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// GET /api/movies/:id/videos
router.get('/:id/videos', async (req, res, next) => {
  try {
    const data = await TMDBService.getMovieVideos(req.params.id);
    res.json(data);
  } catch (error) {
    next(error);
  }
});


// GET /api/movies/:id/dna
router.get('/:id/dna', async (req, res, next) => {
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
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    // Parallel fetch for speed
    const [movie, credits, similar, critics, dna] = await Promise.all([
      TMDBService.getMovie(id),
      TMDBService.getMovieCredits(id),
      TMDBService.getMovieSimilar(id),
      GroqService.getMovieCritics(id, id), // Note: We'll fetch these based on the actual title in the component or here
      GroqService.getMovieCineDNA(id, id)   // Same here
    ]);

    // To avoid double analysis, it might be better to fetch them in the frontend or 
    // fetch the movie first then critics. For now, let's just add the endpoint and
    // let the frontend handle the specialized calls.
    res.json({ ...movie, credits, similar });
  } catch (error) {
    next(error);
  }
});


export default router;
