import { Client } from '@elastic/elasticsearch';

const ELASTIC_URL = process.env.ELASTICSEARCH_URL || 'http://localhost:9200';
const INDEX_NAME = 'movies';

export class SearchService {
  private static client = new Client({ node: ELASTIC_URL });

  // Initialize index if it doesn't exist
  static async setupIndex() {
    try {
      const exists = await this.client.indices.exists({ index: INDEX_NAME });
      if (!exists) {
        await this.client.indices.create({
          index: INDEX_NAME,
          body: {
            mappings: {
              properties: {
                id: { type: 'integer' },
                title: { type: 'text', analyzer: 'english' },
                original_title: { type: 'text' },
                overview: { type: 'text', analyzer: 'english' },
                genres: { type: 'keyword' },
                suggest: { type: 'completion' }
              }
            }
          }
        });
        console.log('✅ Elasticsearch index created:', INDEX_NAME);
      }
    } catch (error) {
      console.warn('⚠️ Elasticsearch is not available or setup failed.');
    }
  }

  // Phase 8: Autocomplete fuzzy search
  static async suggest(query: string) {
    try {
      // Fuzzy matching via Multi-Match
      const result = await this.client.search({
        index: INDEX_NAME,
        body: {
          query: {
            multi_match: {
              query,
              fields: ['title^3', 'original_title^2', 'overview'],
              fuzziness: 'AUTO'
            }
          },
          size: 10
        }
      });
      return result.hits.hits.map((h: any) => h._source);
    } catch (error) {
      console.error('Elasticsearch query failed:', error);
      return [];
    }
  }

  // Function meant to be called by BullMQ worker nightly
  static async indexMovie(movie: any) {
    try {
      await this.client.index({
        index: INDEX_NAME,
        id: movie.id.toString(),
        body: {
          id: movie.id,
          title: movie.title,
          original_title: movie.original_title,
          overview: movie.overview,
          genres: movie.genres?.map((g: any) => g.name) || [],
          suggest: { input: [movie.title, movie.original_title].filter(Boolean) }
        }
      });
    } catch (error) {
      console.error('Failed to index movie:', error);
    }
  }
}

// Automatically try to setup on boot
SearchService.setupIndex();
