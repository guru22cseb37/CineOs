const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.TMDB_API_KEY;

type FetchOptions = {
  endpoint: string;
  params?: Record<string, string | number | boolean>;
};

export class TMDBService {
  private static async fetchFromTMDB<T>({ endpoint, params }: FetchOptions): Promise<T> {
    if (!TMDB_API_KEY) {
      console.warn('⚠️ TMDB_API_KEY is not defined in the environment.');
    }

    const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    if (TMDB_API_KEY) {
      url.searchParams.append('api_key', TMDB_API_KEY);
    }

    // Retry up to 3 times on transient network errors
    let lastError: Error | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await fetch(url.toString(), {
          headers: {
            'Content-Type': 'application/json',
            ...(process.env.TMDB_ACCESS_TOKEN ? { Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}` } : {})
          }
        });

        if (!response.ok) {
          throw new Error(`TMDB API Error: ${response.status} ${response.statusText}`);
        }

        return response.json() as Promise<T>;
      } catch (err: any) {
        lastError = err;
        if (attempt < 2) {
          await new Promise(r => setTimeout(r, 300 * (attempt + 1)));
        }
      }
    }

    throw lastError!;
  }

  static async getTrendingMovies(timeWindow: 'day' | 'week' = 'week') {
    return this.fetchFromTMDB<any>({ endpoint: `/trending/movie/${timeWindow}` });
  }

  static async getPopularMovies(page = 1) {
    return this.fetchFromTMDB<any>({ endpoint: `/movie/popular`, params: { page } });
  }

  static async getTopRatedMovies(page = 1) {
    return this.fetchFromTMDB<any>({ endpoint: `/movie/top_rated`, params: { page } });
  }

  static async discoverMoviesByLanguage(language: string, page = 1) {
    return this.fetchFromTMDB<any>({ 
      endpoint: `/discover/movie`, 
      params: { with_original_language: language, page } 
    });
  }

  static async discoverMoviesByGenre(genreId: number, page = 1) {
    return this.fetchFromTMDB<any>({ 
      endpoint: `/discover/movie`, 
      params: { with_genres: genreId, page } 
    });
  }

  // Generic discover for AI-generated params
  static async discoverMovies(params: Record<string, string | number | boolean>) {
    return this.fetchFromTMDB<any>({ endpoint: `/discover/movie`, params });
  }

  // For auto-playing trailers
  static async getMovieVideos(id: string) {
    return this.fetchFromTMDB<any>({ endpoint: `/movie/${id}/videos` });
  }

  // Phase 7: Deep UI Methods
  static async getMovie(id: string) {
    return this.fetchFromTMDB<any>({ endpoint: `/movie/${id}` });
  }

  static async getMovieCredits(id: string) {
    return this.fetchFromTMDB<any>({ endpoint: `/movie/${id}/credits` });
  }

  static async getMovieSimilar(id: string) {
    return this.fetchFromTMDB<any>({ endpoint: `/movie/${id}/similar` });
  }

  static async getActors(letter: string, page = 1) {
    return this.fetchFromTMDB<any>({ 
      endpoint: `/search/person`, 
      params: { query: letter, page } 
    });
  }

  static async getActorDetails(id: string) {
    return this.fetchFromTMDB<any>({ endpoint: `/person/${id}` });
  }

  static async getActorMovies(id: string) {
    return this.fetchFromTMDB<any>({ endpoint: `/person/${id}/movie_credits` });
  }
}
