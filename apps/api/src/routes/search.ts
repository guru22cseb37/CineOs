import { Router } from 'express';
import { SearchService } from '../services/search.service';

const router = Router();

// GET /api/search/suggest?q=Dark
router.get('/suggest', async (req, res, next) => {
  try {
    const q = req.query.q as string;
    
    if (!q || q.length < 2) {
      return res.json([]); // Don't search for tiny strings to save ES load
    }

    const suggestions = await SearchService.suggest(q);
    res.json(suggestions);
  } catch (error) {
    next(error);
  }
});

export default router;
