export default async function handler(req, res) {
  const { prompt, systemMessage, temperature } = req.body;
  const adminPassword = req.headers['x-admin-password'];
  
  // SECURE: Vérification du mot de passe admin
  if (adminPassword !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Accès IA refusé. Mot de passe incorrect.' });
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: 'Clé OpenAI manquante sur le serveur.' });
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
          { role: 'system', content: systemMessage || 'You are a professional sales auditor.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: temperature || 0.3,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json(errorData);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('AI Proxy Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
