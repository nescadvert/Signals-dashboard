export default async function handler(req, res) {
  const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    return res.status(500).json({ error: 'Airtable configuration missing' });
  }

  try {
    const TABLE_NAME = 'Signals';
    // Filter for Hot signals only, that are not Ignored
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(TABLE_NAME)}?maxRecords=10&sort%5B0%5D%5Bfield%5D=${encodeURIComponent('Published at')}&sort%5B0%5D%5Bdirection%5D=desc&filterByFormula=${encodeURIComponent("AND({Level} = 'Hot', NOT({Status} = 'Ignored'))")}`;
    
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` }
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ error: errorData.error?.message || 'Airtable error' });
    }

    const data = await response.json();
    
    // Anonymize and map to simple objects
    const simplified = data.records.map(record => {
      const author = record.fields['Author name'] || 'Prospect';
      const parts = author.trim().split(' ');
      const anonymized = parts.length > 1 
        ? `${parts[0]} ${parts[parts.length-1][0]}.` 
        : parts[0];

      return {
        author: anonymized,
        postText: record.fields['Post text'] || '',
        date: record.fields['Published at'] || new Date().toISOString(),
        finalScore: record.fields['Final score'] || 0,
        businessModelType: record.fields['business_model_type'] || 'B2B'
      };
    });

    return res.status(200).json(simplified.slice(0, 3));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
