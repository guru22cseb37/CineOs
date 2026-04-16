import { MovieCandidate } from '@cineos/types';

export class RecommendationService {
  /**
   * Phase 1: Rule-Based Filtering
   */
  static filterCandidates(
    candidates: MovieCandidate[],
    seed: MovieCandidate
  ): MovieCandidate[] {
    return candidates.filter(m =>
      m.vote_average >= 7.0 &&
      m.genre_ids.some(g => seed.genre_ids.includes(g)) &&
      m.id !== seed.id
    );
  }

  /**
   * Phase 2: Weighted Scoring algorithm for movies
   */
  static scoreMovie(
    candidate: MovieCandidate,
    seed: MovieCandidate,
    userHistory: number[]
  ): number {
    const genreOverlap = candidate.genre_ids
      .filter(g => seed.genre_ids.includes(g)).length;

    const genreScore   = (genreOverlap / Math.max(seed.genre_ids.length, 1)) * 3.0;
    const ratingScore  = candidate.vote_average * 1.5;
    const popScore     = Math.log10(candidate.popularity + 1) * 0.5;
    const noveltyScore = userHistory.includes(candidate.id) ? -2.0 : 1.0;
    const langScore    = candidate.original_language === seed.original_language ? 1.5 : 0;

    return genreScore + ratingScore + popScore + noveltyScore + langScore;
  }

  /**
   * Recommend logic for a list of candidates against a seed movie.
   */
  static generateRecommendations(
    candidates: MovieCandidate[],
    seed: MovieCandidate,
    userHistory: number[]
  ) {
    const filtered = this.filterCandidates(candidates, seed);
    
    const scored = filtered.map(movie => ({
      movie,
      score: this.scoreMovie(movie, seed, userHistory)
    }));

    // Sort by descending score
    return scored.sort((a, b) => b.score - a.score);
  }
}
