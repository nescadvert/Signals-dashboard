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
    Your mission is to filter out irrelevant leads and identify ONLY high-intent producers, artisans, winemakers or physical product brands.

    EXCLUSION RULES (Return exclusion_flag: true if):
    - The author is a Freelance, Agency, Coach, SaaS, or Service Provider (not a producer).
    - The content is a job offer, a generic motivational post, or a personal update without business intent.
    - The author is looking for a job or a service, but is not a potential client for an ecommerce agency.

    SCORING CRITERIA (0-100):
    - intentScore: Is the person actively looking for a solution/help?
    - activityScore: Is the person's business a "core target" (Physical products, wine, artisanal)?
    - finalScore: Weighted average (60% intent, 40% activity).

    OUTPUT JSON FORMAT:
    {
      "intentScore": number,
      "activityScore": number,
      "finalScore": number,
      "level": "Hot" | "Warm" | "Cold",
      "business_model_type": "producer" | "service" | "other",
      "signalsDetected": ["tag1", "tag2"],
      "reason": "Short summary of why",
      "nextAction": "Recommended next step",
      "suggestedDM": "A short, personalized, non-salesy LinkedIn DM in French",
      "suggestedComment": "A thoughtful public comment in French",
      "exclusion_flag": boolean
    }

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
      return JSON.parse(content);
    } catch (error) {
      clearTimeout(timeoutId);
      const msg = error.name === 'AbortError' ? 'Le serveur a mis trop de temps à répondre (Timeout 20s)' : error.message;
      if (retryCount > 0 && error.name !== 'AbortError') {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return generateSignalAnalysis(signal, retryCount - 1);
      }
      throw new Error(msg);
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
