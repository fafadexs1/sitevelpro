import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {createClient} from '@/utils/supabase/server';

type Settings = {
    apiKey: string | undefined;
    model: string;
}

// Função para obter a chave da API e o modelo do banco de dados
async function getAiSettings(): Promise<Settings> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('system_settings')
      .select('key, value')
      .in('key', ['GEMINI_API_KEY', 'GEMINI_MODEL']);

    if (error || !data) {
      console.warn('AI settings not found in DB, checking environment variables.');
      return {
        apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
        model: process.env.GEMINI_MODEL || 'gemini-2.5-flash'
      };
    }
    
    const settingsMap = new Map(data.map(item => [item.key, item.value]));

    return {
        apiKey: settingsMap.get('GEMINI_API_KEY') || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
        model: settingsMap.get('GEMINI_MODEL') || 'gemini-2.5-flash'
    }

  } catch (e) {
    console.error("Error fetching AI settings:", e);
    return {
        apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
        model: process.env.GEMINI_MODEL || 'gemini-2.5-flash'
    };
  }
}

// Inicializa o Genkit de forma assíncrona
const initializeGenkit = async () => {
    const { apiKey, model } = await getAiSettings();

    if (!apiKey) {
      console.error("CRITICAL: Gemini API Key is not configured. AI features will fail.");
    }
    
    return genkit({
      plugins: [googleAI({ apiKey: apiKey || '' })],
      model: model || 'gemini-2.5-flash',
    });
};

// Exportamos uma promessa que resolve para a instância do 'ai'
export const aiPromise = initializeGenkit();

// Para uso nos fluxos, você pode fazer 'const ai = await aiPromise;'
// A abordagem mais simples é refatorar os fluxos para aguardar a promessa.

// Vamos criar um objeto 'ai' com a chave do env para compatibilidade,
// mas o ideal é sempre usar a promessa.
export const ai = genkit({
  plugins: [googleAI({apiKey: process.env.GEMINI_API_KEY})],
  model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
});
