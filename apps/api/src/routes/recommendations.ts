import { Router } from 'express';
import { RecommendationService } from '../services/recommendation.service';
import { MovieCandidate } from '@cineos/types';

const router = Router();

// POST /api/recommendations/ai
router.post('/ai', async (req, res, next) => {
  try {
    const { candidates, seed, userHistory } = req.body;

    if (!candidates || !seed) {
      return res.status(400).json({ error: 'candidates and seed are required parameters' });
    }

    const recommendations = RecommendationService.generateRecommendations(
      candidates as MovieCandidate[],
      seed as MovieCandidate,
      (userHistory as number[]) || []
    );

    res.json({
      seedId: seed.id,
      algorithm: 'weighted-scoring-v1',
      results: recommendations.slice(0, 10) // Top 10 matches
    });
  } catch (error) {
    next(error);
  }
});

export default router;
