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
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    try {
      console.log('AI Analysis: Starting production request...');
      const response = await fetch('/api/ai-proxy', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-password': adminToken
        },
        signal: controller.signal,
        body: JSON.stringify({ 
          prompt, 
          systemMessage: 'You are a professional sales auditor. Output only valid JSON. Be conservative and skeptical.',
          temperature: 0.3
        })
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || errorData.error || `Erreur d'accès à l'IA (${response.status})`;
        throw new Error(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      console.log('AI Analysis: Success, parsing content...');
      return JSON.parse(content);
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('AI Analysis Fetch Error:', error.name === 'AbortError' ? 'Timeout (15s)' : error.message);
      
      if (retryCount > 0 && error.name !== 'AbortError') {
        console.log(`AI Analysis: Retrying... (${retryCount} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return generateSignalAnalysis(signal, retryCount - 1);
      }
      throw error;
    }
  }

  // En DÉVELOPPEMENT (Local), on continue en direct si la clé est présente
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API Key is missing. Please check your .env file.');
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a professional sales auditor. Output only valid JSON. Be conservative and skeptical.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || errorData.error || 'OpenAI API request failed';
      throw new Error(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
    }

    const data = await response.json();
    let content = data.choices[0].message.content;

    if (content.includes('```')) {
      content = content.replace(/```json\n?|```/g, '').trim();
    }

    return JSON.parse(content);
  } catch (error) {
    if (retryCount > 0) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return generateSignalAnalysis(signal, retryCount - 1);
    }
    throw error;
  }
};
