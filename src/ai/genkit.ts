
// This file is no longer used for the article generation flow, 
// but is kept for potential future Genkit-based features.
// The core AI logic has been moved to a direct SDK implementation
// in `src/ai/flows/generate-article-flow.ts`.

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// We keep a simple, environment-based Genkit initialization
// for any other potential flows that might be added later.
export const ai = genkit({
  plugins: [googleAI({apiKey: process.env.GEMINI_API_KEY})],
});
