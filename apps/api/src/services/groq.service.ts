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
    if (!process.env.GROQ_API_KEY) return { scholar: '', hype: '', technical: '' };

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are three elite movie critics. Return a JSON object with three keys: "scholar" (deep, analytical, focused on cinematography and subtext), "hype" (enthusiastic, focused on fun, action, and modern vibes), and "technical" (a seasoned Director of Photography focusing on lenses, lighting, framing, and technical mastery). Each review should be 2-3 sentences. Return ONLY valid JSON.'
        },
        { role: 'user', content: `Movie: "${title}". Overview: ${overview}` }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 768,
      response_format: { type: 'json_object' }
    });

    const content = completion.choices[0]?.message?.content || '{}';
    return JSON.parse(content);
  }

  static async getMovieCineDNA(title: string, overview: string): Promise<{ labels: string[]; values: number[] }> {
    if (!process.env.GROQ_API_KEY) return { labels: [], values: [] };

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Analyze the "DNA" of a movie. Return a JSON object with two arrays: "labels" (Cinematography, Storyweight, Adrenaline, Heart, Complexity) and "values" (integers 0-100 representing the Intensity). Be accurate to the film style. Return ONLY valid JSON.'
        },
        { role: 'user', content: `Analyze the DNA of: "${title}". Description: ${overview}` }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.1,
      max_tokens: 256,
      response_format: { type: 'json_object' }
    });

    const content = completion.choices[0]?.message?.content || '{}';
    return JSON.parse(content);
  }


  static async getSceneTrivia(movieTitle: string, sceneDescription: string): Promise<string> {
    if (!process.env.GROQ_API_KEY) return '';

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a film historian. Provide a single, fascinating "cinephile trivia" fact about a specific scene or aspect of the movie. Keep it under 40 words.'
        },
        { role: 'user', content: `Movie: "${movieTitle}". Scene/Aspect: ${sceneDescription}` }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.8,
      max_tokens: 100
    });

    return completion.choices[0]?.message?.content?.trim() || '';
  }

  static async translateVibeToParams(vibe: string): Promise<Record<string, string>> {
    if (!process.env.GROQ_API_KEY) return {};

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a movie expert. Translate an abstract "vibe" (e.g., "Gritty Neon Noir") into TMDB discover API parameters. Return JSON only.'
        },
        { role: 'user', content: `Vibe: ${vibe}` }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.2,
      max_tokens: 256,
      response_format: { type: 'json_object' }
    });

    const content = completion.choices[0]?.message?.content || '{}';
    return JSON.parse(content);
  }
}

