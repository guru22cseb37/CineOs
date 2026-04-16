import { Router } from 'express';
import { TMDBService } from '../services/tmdb.service';

const router = Router();




// GET /api/actors
router.get('/', async (req, res, next) => {
  try {
    const letter = typeof req.query.letter === 'string' ? req.query.letter : 'a';
    const language = typeof req.query.language === 'string' ? req.query.language : undefined;
    const page = parseInt(req.query.page as string) || 1;
    
    let data;
    // Explicitly check for a non-empty language string that isn't 'all'
    if (language && language.trim() !== '' && language !== 'all') {
      data = await TMDBService.getActorsByLanguage(language, page);
    } else {
      data = await TMDBService.getActors(letter, page);
    }
    
    res.json(data);
  } catch (error) {
    next(error);
  }
});



// GET /api/actors/:id/connections
router.get('/:id/connections', async (req, res, next) => {
  try {
    const { id } = req.params;
    const connections = await TMDBService.getActorConnections(id);
    res.json(connections);
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

