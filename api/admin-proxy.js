export default async function handler(req, res) {
  const { method, path, body } = req.body;
  const adminPassword = req.headers['x-admin-password'];
  
  // SECURE: Le mot de passe doit correspondre à celui défini dans Vercel
  if (adminPassword !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Accès Admin refusé. Mot de passe incorrect.' });
  }

  const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    return res.status(500).json({ error: 'Configuration Airtable manquante sur le serveur.' });
  }

  // Reconstruction de l'URL Airtable
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}${path}`;

  try {
    const options = {
      method: method || 'GET',
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    if (body && (method === 'POST' || method === 'PATCH' || method === 'PUT')) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json(errorData);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Admin Proxy Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
