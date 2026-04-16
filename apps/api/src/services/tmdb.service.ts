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

  static async getMovieImages(id: string) {
    return this.fetchFromTMDB<any>({ endpoint: `/movie/${id}/images` });
  }


  static async getActorsByLanguage(language: string, page = 1) {
    // Mapping languages to regions for better filtering
    const regionMap: Record<string, string> = {
      'ta': 'IN', 'hi': 'IN', 'te': 'IN', 'ml': 'IN', 'ko': 'KR', 'en': 'US', 'ja': 'JP'
    };
    const region = regionMap[language];

    // 1. Discover popular movies in that language/region
    const moviesData = await this.fetchFromTMDB<any>({ 
      endpoint: `/discover/movie`, 
      params: { 
        with_original_language: language, 
        region: region || '',
        sort_by: 'popularity.desc',
        page: page
      } 
    });

    const movies = moviesData.results?.slice(0, 15) || [];
    
    // 2. Fetch credits for these movies in parallel
    const creditsPromises = movies.map((m: any) => this.getMovieCredits(m.id));
    const allCredits = await Promise.all(creditsPromises);

    // 3. Extract and deduplicate actors
    const actorMap = new Map<number, any>();
    allCredits.forEach(credit => {
      credit.cast?.slice(0, 12).forEach((actor: any) => {
        // Filter out non-actors (like directors in credits) or very low popularity entries
        if (actor.known_for_department === 'Acting' && !actorMap.has(actor.id)) {
          actorMap.set(actor.id, {
            ...actor,
            popularity: actor.popularity || 0
          });
        }
      });
    });

    // 4. Return formatted results sorted by popularity
    const results = Array.from(actorMap.values())
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 20); // Limit to top 20 for a clean view

    return {
      results,
      page: 1,
      total_pages: 1,
      total_results: results.length
    };

  static async getActorConnections(id: string) {
    const movies = await this.getActorMovies(id);
    const movieIds = movies.cast?.slice(0, 10).map((m: any) => m.id) || [];
    
    const castsPromises = movieIds.map((mid: number) => this.getMovieCredits(String(mid)));
    const allCasts = await Promise.all(castsPromises);
    
    const connections = new Map<number, { id: number, name: string, count: number, profile_path: string }>();
    
    allCasts.forEach((castData: any) => {
      castData.cast?.slice(0, 8).forEach((member: any) => {
        if (member.id !== parseInt(id)) {
          const existing = connections.get(member.id);
          if (existing) {
            existing.count++;
          } else {
            connections.set(member.id, {
              id: member.id,
              name: member.name,
              count: 1,
              profile_path: member.profile_path
            });
          }
        }
      });
    });

    const results = Array.from(connections.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    return results;
  }
}



