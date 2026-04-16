export interface MovieCandidate {
  id: number;
  genre_ids: number[];
  vote_average: number;
  popularity: number;
  original_language: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  preferences: {
    genres: number[];
    languages: string[];
    mood?: string;
  };
}

export type InteractionType = 'like' | 'dislike' | 'view' | 'complete';

export interface Interaction {
  userId: string;
  movieId: number;
  type: InteractionType;
  timestamp: Date;
  sessionId?: string;
}

export interface WatchlistItem {
  userId: string;
  movieId: number;
  tmdbData: {
    title: string;
    poster: string;
    rating: number;
  };
  addedAt: Date;
}
