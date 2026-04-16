import { Router } from 'express';
import { TMDBService } from '../services/tmdb.service';

const router = Router();

// GET /api/actors
router.get('/', async (req, res, next) => {
  try {
    const letter = (req.query.letter as string) || 'a';
    const page = parseInt(req.query.page as string) || 1;
    const data = await TMDBService.getActors(letter, page);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// GET /api/actors/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const [details, credits] = await Promise.all([
      TMDBService.getActorDetails(id),
      TMDBService.getActorMovies(id)
    ]);
    res.json({ ...details, credits });
  } catch (error) {
    next(error);
  }
});

export default router;
