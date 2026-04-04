export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, company, phone } = req.body;
  const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    return res.status(500).json({ error: 'Airtable configuration missing on server' });
  }

  const fields = {
    'Full Name': name || 'Prospect Web',
    'Email': email || '',
    'Company': company || '',
    'Phone': phone || '',
    'Pipeline status': 'New',
    'Level': 'Warm',
    'Notes': `[INTERET SITE WEB] Demande de démo enregistrée.\nEntreprise: ${company || 'N/A'}\nDate: ${new Date().toLocaleString('fr-FR')}`
  };

  try {
    const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent('Leads (CRM)')}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fields })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ error: errorData.error?.message || 'Airtable error' });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
