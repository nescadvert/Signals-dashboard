export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée. Utilisez POST.' });
  }

  const { adminPassword, scanLimit, platform, sourceName, keywords, sourceId } = req.body;

  // SECURE: Le mot de passe doit correspondre à celui défini dans Vercel
  if (adminPassword !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Accès Admin refusé. Mot de passe incorrect.' });
  }

  const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL;

  if (!MAKE_WEBHOOK_URL) {
    return res.status(500).json({ error: 'L\'URL du Webhook Make est manquante sur le serveur Vercel.' });
  }

  try {
    const response = await fetch(MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        trigger_source: 'antigravity_dashboard_production',
        timestamp: new Date().toISOString(),
        scan_limit: scanLimit,
        platform: platform,
        source_name: sourceName,
        keywords: keywords,
        source_id: sourceId
      })
    });

    if (!response.ok) {
      throw new Error(`Webhook Make a répondu avec l'erreur: ${response.statusText}`);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Trigger Scan Proxy Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
