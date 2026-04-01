const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

let adminToken = ''; // Mot de passe admin temporaire pour les requêtes proxy

/**
 * Configure le jeton d'accès pour l'IA sécurisée
 */
export const setAdminToken = (token) => {
  adminToken = token;
};

export const ALLOWED_SIGNALS = [
  'launch', 'problem', 'budget', 'hiring', 'ecommerce', 'ads', 'shopify', 'wix', 
  'prestashop', 'migration', 'seo', 'email', 'newsletter', 'klaviyo', 'conversion', 
  'tracking', 'analytics', 'agency_search', 'recommendation', 'b2b', 'retail', 'direct_to_consumer'
];

export const generateSignalAnalysis = async (signal, retryCount = 1) => {
  const prompt = `
    You are a strictly conservative sales qualification AI for an ecommerce agency.
    Your mission is to filter out irrelevant leads and identify ONLY high-intent producers/artisans.
    ... [PROMPT CONTENT] ...
    SIGNAL DATA:
    - Author: ${signal.author}
    - Platform: ${signal.platform}
    - Content: ${signal.postText}
  `;

  // En PRODUCTION (Vercel), on utilise le Pont Sécurisé pour cacher la clé API OpenAI
  if (import.meta.env.PROD) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); 

    try {
      console.log('--- AI-DEBUG-V3 ---');
      const response = await fetch('/api/ai-proxy', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-password': adminToken || 'MISSING'
        },
        signal: controller.signal,
        body: JSON.stringify({ prompt, systemMessage: 'Act as Sales Qualify AI.', temperature: 0.3 })
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const text = await response.text().catch(() => 'No body');
        throw new Error(`!! AI-SERVICE-ERROR !! [Status ${response.status}] ${text.substring(0, 50)}`);
      }

      const data = await response.json();
      return JSON.parse(data.choices[0].message.content);
    } catch (error) {
      clearTimeout(timeoutId);
      const finalMsg = error.name === 'AbortError' ? 'TIMEOUT_20S' : error.message;
      throw new Error(`!! AI-SERVICE-ERROR !! ${finalMsg}`);
    }
  }

  // En DÉVELOPPEMENT (Local)
  if (!OPENAI_API_KEY) throw new Error('!! AI-SERVICE-ERROR !! API Key missing');

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`!! AI-SERVICE-ERROR !! Local: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    throw new Error(`!! AI-SERVICE-ERROR !! ${error.message}`);
  }
};
