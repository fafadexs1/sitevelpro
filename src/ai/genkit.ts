import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {createClient} from '@/utils/supabase/server';

// Função para obter a chave da API do banco de dados
async function getGeminiApiKey() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'GEMINI_API_KEY')
      .single();

    if (error || !data) {
      console.warn('GEMINI_API_KEY not found in DB, checking environment variables.');
      return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    }
    return data.value;
  } catch (e) {
    console.error("Error fetching Gemini API key:", e);
    return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  }
}

// Inicializa o Genkit de forma assíncrona
const initializeGenkit = async () => {
    const apiKey = await getGeminiApiKey();

    if (!apiKey) {
      console.error("CRITICAL: Gemini API Key is not configured. AI features will fail.");
    }
    
    return genkit({
      plugins: [googleAI({ apiKey: apiKey || '' })],
      model: 'googleai/gemini-2.5-flash',
    });
};

// Exportamos uma promessa que resolve para a instância do 'ai'
export const aiPromise = initializeGenkit();

// Para uso nos fluxos, você pode fazer 'const ai = await aiPromise;'
// No entanto, para simplificar e manter a compatibilidade, vamos exportar um 'ai' que é uma promessa.
// Isso requer um ajuste em como o 'ai' é usado.
// A abordagem mais simples é refatorar os fluxos para aguardar a promessa.

// Vamos manter o 'ai' como está por enquanto, mas a lógica de inicialização foi movida para uma função async.
// E vamos criar um novo objeto 'ai' com a chave.

export const ai = genkit({
  plugins: [googleAI({apiKey: process.env.GEMINI_API_KEY})],
  model: 'googleai/gemini-2.5-flash',
});
