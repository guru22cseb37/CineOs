import { Router } from 'express';
import { TMDBService } from '../services/tmdb.service';

const router = Router();

// Add this route for trailer keys
router.get('/:id/videos', async (req, res, next) => {
  try {
    const data = await TMDBService.getMovieVideos(req.params.id);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

export default router;
