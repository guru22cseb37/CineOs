import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are a movie discovery AI for CineOS. Convert user natural language queries into a JSON object of TMDB API parameters.

Available TMDB parameter keys:
- with_genres: comma-separated genre IDs (Action=28, Comedy=35, Drama=18, Horror=27, Romance=10749, SciFi=878, Thriller=53, Animation=16, Documentary=99, Fantasy=14, Crime=80, Adventure=12, History=36, Music=10402, Mystery=9648, War=10752, Western=37)
- primary_release_date.gte: YYYY-MM-DD
- primary_release_date.lte: YYYY-MM-DD
- vote_average.gte: number 0-10
- sort_by: one of [popularity.desc, vote_average.desc, release_date.desc, revenue.desc]
- with_original_language: ISO code (en, hi, ta, te, ml, ko, ja, fr, es, de, it)
- with_keywords: keyword ids (optional, skip if unsure)

Rules:
- ALWAYS return ONLY valid JSON, no explanation text
- If decade is mentioned (90s = 1990-1999), set date range accordingly
- "recent" or "new" means last 2 years
- "classic" or "old" means before 1990
- "top rated" means vote_average.gte: 7.5 and sort_by: vote_average.desc
- "popular" means sort_by: popularity.desc
- Multiple genres should be comma-separated IDs

Example input: "a tense psychological thriller from the 90s"
Example output: { "with_genres": "53", "primary_release_date.gte": "1990-01-01", "primary_release_date.lte": "1999-12-31", "sort_by": "vote_average.desc" }`;

export class GroqService {
  static async naturalLanguageToParams(query: string): Promise<Record<string, string>> {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not configured');
    }

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: query }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.1,
      max_tokens: 256,
      response_format: { type: 'json_object' }
    });

    const content = completion.choices[0]?.message?.content || '{}';
    return JSON.parse(content);
  }

  static async getMovieMoodDescription(title: string, overview: string): Promise<string> {
    if (!process.env.GROQ_API_KEY) return '';

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a film critic. Write a 1-sentence evocative vibe description of the movie in under 20 words. Be poetic and capture the emotional tone.'
        },
        { role: 'user', content: `Movie: "${title}". Overview: ${overview}` }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.8,
      max_tokens: 60
    });

    return completion.choices[0]?.message?.content?.trim() || '';
  }

  static async getWatchPartyRecommendation(profiles: { name: string; genres: number[] }[]): Promise<string> {
    if (!process.env.GROQ_API_KEY) return '';

    const profilesText = profiles.map(p => `${p.name} likes genres: ${p.genres.join(', ')}`).join('\n');

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a group movie recommendation AI. Given a list of viewer profiles with their genre preferences, suggest the single best genre compromise for a group watch. Return JSON with: { "genre_ids": [list of 1-3 genre ids], "reason": "short explanation" }'
        },
        { role: 'user', content: profilesText }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 128,
      response_format: { type: 'json_object' }
    });

    return completion.choices[0]?.message?.content || '{}';
  }


  static async getMovieCritics(title: string, overview: string): Promise<{ scholar: string; hype: string; technical: string }> {
    if (!process.env.GROQ_API_KEY) return this.getCriticFallbacks();

    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are three elite movie critics. Return a JSON object with three keys: "scholar" (deep, analytical), "hype" (enthusiastic, modern), and "technical" (cinematography focus). Each review 2 sentences. Return ONLY valid JSON.'
          },
          { role: 'user', content: `Movie: "${title}". Overview: ${overview}` }
        ],
        model: 'llama3-8b-8192',
        temperature: 0.7,
        max_tokens: 512,
        response_format: { type: 'json_object' }
      });

      const content = completion.choices[0]?.message?.content || '{}';
      return JSON.parse(content);
    } catch (e) {
      console.error('Groq Critics failed, using fallbacks');
      return this.getCriticFallbacks();
    }
  }

  static async getMovieCineDNA(title: string, overview: string): Promise<{ labels: string[]; values: number[] }> {
    const defaultDNA = {
      labels: ['Cinematography', 'Storyweight', 'Adrenaline', 'Heart', 'Complexity'],
      values: [70, 65, 80, 55, 60]
    };

    if (!process.env.GROQ_API_KEY) return defaultDNA;

    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'Return DNA intensity (0-100) for: Cinematography, Storyweight, Adrenaline, Heart, Complexity. Return ONLY JSON object with "labels" and "values" keys.'
          },
          { role: 'user', content: `Movie: "${title}"` }
        ],
        model: 'llama3-8b-8192',
        temperature: 0.1,
        max_tokens: 128,
        response_format: { type: 'json_object' }
      });

      const content = completion.choices[0]?.message?.content || '{}';
      return JSON.parse(content);
    } catch (e) {
      return defaultDNA;
    }
  }

  private static getCriticFallbacks() {
    return {
      scholar: "A profound exploration of cinematic language, weaving subtext into every frame.",
      hype: "An absolute blast of a ride! The energy and pacing keep you locked in from start to finish.",
      technical: "The masterfully handled lighting and framing create a truly immersive visual canvas."
    };
  }

  static async getSceneTrivia(movieTitle: string, sceneDescription: string): Promise<string> {
    if (!process.env.GROQ_API_KEY) return "The technical mastery in this scene is a testament to the director's unique vision.";

    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a film historian. Provide a single, fascinating "cinephile trivia" fact about this scene. Under 30 words.'
          },
          { role: 'user', content: `Movie: "${movieTitle}". Scene: ${sceneDescription}` }
        ],
        model: 'llama3-8b-8192',
        temperature: 0.8,
        max_tokens: 100
      });

      return completion.choices[0]?.message?.content?.trim() || "";
    } catch (e) {
      return "This scene is widely regarded by critics as a masterclass in atmospheric tension and visual storytelling.";
    }
  }

  static async translateVibeToParams(vibe: string): Promise<Record<string, string>> {
    if (!process.env.GROQ_API_KEY) return { sort_by: 'popularity.desc' };

    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'Translate a movie vibe into TMDB discover API parameters (with_genres, etc). Return ONLY JSON.'
          },
          { role: 'user', content: `Vibe: ${vibe}` }
        ],
        model: 'llama3-8b-8192',
        temperature: 0.2,
        max_tokens: 256,
        response_format: { type: 'json_object' }
      });

      const content = completion.choices[0]?.message?.content || '{}';
      return JSON.parse(content);
    } catch (e) {
      return { sort_by: 'popularity.desc' };
    }
  }
}

