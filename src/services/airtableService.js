import { ALLOWED_SIGNALS } from './aiService';

const AIRTABLE_API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID;
const MAKE_WEBHOOK_URL = import.meta.env.VITE_MAKE_WEBHOOK_URL;
const TABLE_NAME = 'Signals';

let adminToken = ''; // Mot de passe admin temporaire pour les requêtes proxy

/**
 * Configure le jeton d'accès pour les fonctions sécurisées
 */
export const setAdminToken = (token) => {
  adminToken = token;
};

/**
 * Envoie une requête à Airtable, soit en direct (local) soit via le Pont Sécurisé (Vercel)
 */
const secureAirtableRequest = async ({ method = 'GET', path, body = null }) => {
  // En PRODUCTION (Vercel), on utilise le Pont Sécurisé pour cacher la clé API
  if (import.meta.env.PROD) {
    const response = await fetch('/api/admin-proxy', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-admin-password': adminToken
      },
      body: JSON.stringify({ method, path, body })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Erreur d'accès (${response.status})`);
    }

    return await response.json();
  }

  // En DÉVELOPPEMENT (Local), on continue en direct sur Airtable avec la clé du .env
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}${path}`;
  const options = {
    method,
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json'
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Airtable error');
  }

  return await response.json();
};

const normalizeLevel = (val) => {
  if (!val) return 'Cold';
  const levelStr = Array.isArray(val) ? String(val[0]) : String(val);
  const l = levelStr.trim().toLowerCase();
  
  if (l.includes('hot')) return 'Hot';
  if (l.includes('warm')) return 'Warm';
  if (l.includes('cold')) return 'Cold';
  
  return 'Cold';
};

const sanitize = (val) => {
  if (val === null || val === undefined) return '';
  if (typeof val !== 'string') return val;
  // Remove control characters (except newline/tab) and zero-width spaces that can break Airtable
  return val.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F\u200B-\u200D\uFEFF]/g, '').trim();
};

export const fetchSignals = async () => {
  let allRecords = [];
  let offset = '';
  
  try {
    do {
      // On passe uniquement le fragment de chemin URL au proxy
      const path = `/${encodeURIComponent(TABLE_NAME)}?offset=${offset}&sort%5B0%5D%5Bfield%5D=${encodeURIComponent('Published at')}&sort%5B0%5D%5Bdirection%5D=desc&filterByFormula=${encodeURIComponent("NOT({Status} = 'Ignored')")}`;
      
      const data = await secureAirtableRequest({ method: 'GET', path });
      
      allRecords = [...allRecords, ...data.records];
      offset = data.offset || '';
    } while (offset);

    return allRecords.map(record => ({
      id: record.id,
      author: record.fields['Author name'] || 'Unknown Author',
      postText: record.fields['Post text'] || '',
      date: record.fields['Published at'] || new Date().toISOString(),
      postUrl: record.fields['Post URL'] || '#',
      authorProfileUrl: record.fields['Author profile URL'] || '#',
      platform: record.fields['Platform'] || 'Other',
      status: record.fields['Status'] || 'New',
      level: normalizeLevel(record.fields['Level'] || record.fields['level'] || record.fields['Priority'] || ''),
      businessModelType: record.fields['business_model_type'] || '',
      score: record.fields['Final score'] || 0,
      intentScore: record.fields['Intent score'] || 0,
      activityScore: record.fields['Activity score'] || 0,
      finalScore: record.fields['Final score'] || 0,
      signalsDetected: record.fields['Signals detected'] || [],
      reason: record.fields['Reason'] || '',
      nextAction: record.fields['Next action'] || '',
      suggestedDM: record.fields['Suggested DM'] || '',
      suggestedComment: record.fields['Suggested Comment'] || '',
      dmStatus: record.fields['DM status'] || 'To send',
      dmSentAt: record.fields['DM sent at'] || null,
      dmChannel: record.fields['DM channel'] || null,
      lastModified: record.fields['Last Modified'] || null,
      postImage: record.fields['Image'] || null,
      source: record.fields['Source'] || ''
    }));
  } catch (error) {
    console.error('Airtable Fetch Signals Error:', error);
    throw error;
  }
};

export const fetchSources = async () => {
  try {
    const path = `/${encodeURIComponent('Sources')}?sort%5B0%5D%5Bfield%5D=Name&sort%5B0%5D%5Bdirection%5D=asc`;
    const data = await secureAirtableRequest({ method: 'GET', path });
    
    return data.records.map(record => ({
      id: record.id,
      name: record.fields['Name'] || 'Unnamed Source',
      platform: record.fields['Platform'] || '',
      type: record.fields['Type'] || 'Social',
      status: record.fields['Is active'] ? 'Active' : 'Inactive',
      lastScan: record.fields['Last scan'] || null,
      signalCount: record.fields['Signal count'] || 0,
      keywords: record.fields['Keywords'] || ''
    }));
  } catch (error) {
    console.error('Airtable Fetch Sources Error:', error);
    throw error;
  }
};

export const fetchLeads = async () => {
  try {
    const path = `/${encodeURIComponent('Leads (CRM)')}`;
    const data = await secureAirtableRequest({ method: 'GET', path });
    
    return data.records.map(record => ({
      id: record.id,
      name: record.fields['Full Name'] || `${record.fields['First Name'] || ''} ${record.fields['Last Name'] || ''}`.trim() || 'Unnamed Lead',
      firstName: record.fields['First Name'] || '',
      lastName: record.fields['Last Name'] || '',
      company: record.fields['Company'] || '',
      status: record.fields['Pipeline status'] || 'New',
      lastContact: record.fields['Last contact date'] || null,
      nextFollowUp: record.fields['Next follow-up date'] || null,
      notes: record.fields['Notes'] || '',
      email: record.fields['Email'] || '',
      phone: record.fields['Phone'] || '',
      profileUrl: record.fields['LinkedIn URL'] || '',
      title: record.fields['Title / Role'] || '',
      website: record.fields['Website'] || '',
      intentScore: record.fields['Intent score'] || 0,
      activityScore: record.fields['Activity score'] || 0,
      finalScore: record.fields['Final score'] || 0,
      level: record.fields['Level'] || 'Cold'
    }));
  } catch (error) {
    console.error('Airtable Fetch Leads Error:', error);
    throw error;
  }
};

export const createSource = async (sourceData) => {
  const path = `/${encodeURIComponent('Sources')}`;
  
  const fields = {
    'Name': sanitize(sourceData.name),
    'Platform': sourceData.platform || '',
    'Keywords': sanitize(sourceData.keywords),
    'Is active': sourceData.isActive !== false,
    'Cadence': sourceData.cadence || 'Daily'
  };

  try {
    return await secureAirtableRequest({ 
      method: 'POST', 
      path, 
      body: { fields } 
    });
  } catch (error) {
    console.error('Airtable Source Creation Error:', error);
    throw error;
  }
};

export const updateSourceStatus = async (recordId, isActive) => {
  const path = `/${encodeURIComponent('Sources')}/${recordId}`;
  
  try {
    return await secureAirtableRequest({
      method: 'PATCH',
      path,
      body: {
        fields: {
          'Is active': isActive
        }
      }
    });
  } catch (error) {
    console.error('Airtable Source Status Update Error:', error);
    throw error;
  }
};

export const updateSource = async (recordId, sourceData) => {
  const path = `/${encodeURIComponent('Sources')}/${recordId}`;
  
  const fields = {
    'Name': sanitize(sourceData.name),
    'Platform': sourceData.platform || '',
    'Keywords': sanitize(sourceData.keywords),
    'Is active': sourceData.isActive !== false,
    'Cadence': sourceData.cadence || 'Daily'
  };

  try {
    return await secureAirtableRequest({
      method: 'PATCH',
      path,
      body: { fields }
    });
  } catch (error) {
    console.error('Airtable Source Update Error:', error);
    throw error;
  }
};

export const deleteSource = async (recordId) => {
  const path = `/${encodeURIComponent('Sources')}/${recordId}`;
  
  try {
    return await secureAirtableRequest({ method: 'DELETE', path });
  } catch (error) {
    console.error('Airtable Source Delete Error:', error);
    throw error;
  }
};

export const updateSignalStatus = async (recordId, newStatus) => {
  const path = `/${encodeURIComponent(TABLE_NAME)}/${recordId}`;
  
  try {
    return await secureAirtableRequest({
      method: 'PATCH',
      path,
      body: {
        fields: {
          'Status': newStatus
        }
      }
    });
  } catch (error) {
    console.error('Airtable Update Error:', error);
    throw error;
  }
};

export const updateSignalAnalysis = async (recordId, analysis, level) => {
  const path = `/${encodeURIComponent(TABLE_NAME)}/${recordId}`;
  
  // SANITIZE: AI tags
  const safeTags = Array.isArray(analysis.signalsDetected) 
    ? analysis.signalsDetected.filter(tag => ALLOWED_SIGNALS.includes(String(tag).toLowerCase())) 
    : [];

  const finalScore = Number(analysis.finalScore || 0);
  const isExcluded = analysis.exclusion_flag === true;
  
  // STATUS MAPPING: Force exact strings for Airtable Single-Select
  let newStatus = 'Reviewed';
  if (isExcluded) newStatus = 'Ignored';
  else if (finalScore >= 70) newStatus = 'Qualified';

  const fields = {
    'business_model_type': sanitize(analysis.business_model_type),
    'Signals detected': safeTags,
    'Reason': sanitize(analysis.reason),
    'Next action': sanitize(analysis.nextAction || 'Ignore'),
    'Suggested DM': sanitize(analysis.suggestedDM || ''),
    'Suggested Comment': sanitize(analysis.suggestedComment || ''),
    'Intent score': Number(analysis.intentScore || 0),
    'Activity score': Number(analysis.activityScore || 0),
    'Final score': finalScore,
    'Level': level,
    'DM status': (isExcluded || level === 'Cold') ? 'Ignored' : 'Ready',
    'Status': newStatus
  };

  try {
    return await secureAirtableRequest({
      method: 'PATCH',
      path,
      body: { fields }
    });
  } catch (error) {
    console.error('Airtable AI Write-back Error:', error);
    throw error;
  }
};

export const archiveSignal = async (signal) => {
  const ARCHIVE_TABLE = 'Signals_Archived';
  const path = `/${encodeURIComponent(ARCHIVE_TABLE)}`;
  
  // Build fields object - only include if they have a non-empty value
  const rawFields = {
    'Author name': signal.author,
    'Post text': signal.postText,
    'Published at': signal.date,
    'Post URL': signal.postUrl,
    'Author profile URL': signal.authorProfileUrl,
    'Platform': signal.platform,
    'Status': 'Ignored',
    'Level': signal.level,
    'Intent score': signal.intentScore,
    'Activity score': signal.activityScore,
    'Final score': signal.finalScore,
    'Signals detected': Array.isArray(signal.signalsDetected) ? signal.signalsDetected.join(', ') : '',
    'Reason': signal.reason,
    'Next action': signal.nextAction,
    'Suggested DM': signal.suggestedDM,
    'Suggested Comment': signal.suggestedComment,
    'DM status': signal.dmStatus,
    'DM sent at': signal.dmSentAt,
    'DM channel': signal.dmChannel,
    'business_model_type': signal.businessModelType
  };

  // CLEANUP: Remove any fields that are null, undefined or empty strings
  const fields = {};
  Object.keys(rawFields).forEach(key => {
    const val = rawFields[key];
    if (val !== null && val !== undefined && val !== '') {
      fields[key] = val;
    }
  });

  try {
    return await secureAirtableRequest({ 
      method: 'POST', 
      path, 
      body: { fields } 
    });
  } catch (error) {
    console.error('Airtable Archive Logic Error:', error);
    throw error;
  }
};

export const deleteSignal = async (recordId) => {
  const path = `/${encodeURIComponent(TABLE_NAME)}/${recordId}`;
  
  try {
    return await secureAirtableRequest({ method: 'DELETE', path });
  } catch (error) {
    console.error('Airtable Delete Error:', error);
    throw error;
  }
};

export const updateDMStatus = async (recordId, newDMStatus) => {
  const path = `/${encodeURIComponent(TABLE_NAME)}/${recordId}`;
  
  const fields = {
    'DM status': newDMStatus
  };

  // If status is "Sent", also update the "DM sent at" date
  if (newDMStatus === 'Sent') {
    fields['DM sent at'] = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  }

  try {
    return await secureAirtableRequest({
      method: 'PATCH',
      path,
      body: { fields }
    });
  } catch (error) {
    console.error('Airtable DM Update Error:', error);
    throw error;
  }
};

export const triggerScanSignals = async (scanLimit = 50, platform = '', sourceName = '', keywords = '', sourceId = '') => {
  // En PRODUCTION (Vercel), on utilise le Pont Sécurisé pour ne pas exposer l'URL du Webhook au client
  if (import.meta.env.PROD) {
    try {
      const response = await fetch('/api/trigger-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminPassword: adminToken,
          scanLimit,
          platform,
          sourceName,
          keywords,
          sourceId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erreur de scan (${response.status})`);
      }

      return true;
    } catch (error) {
      console.error('Production Scan Trigger Error:', error);
      throw error;
    }
  }

  // En DÉVELOPPEMENT (Local), on continue en direct sur le Webhook s'il est configuré dans le .env
  if (!MAKE_WEBHOOK_URL) {
    throw new Error('Make Webhook URL is missing. Please check your .env file.');
  }

  try {
    const response = await fetch(MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        trigger_source: 'antigravity_dashboard_local',
        timestamp: new Date().toISOString(),
        scan_limit: scanLimit,
        platform: platform,
        source_name: sourceName,
        keywords: keywords,
        source_id: sourceId
      })
    });

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Webhook Trigger Error:', error);
    throw error;
  }
};

export const createLeadFromSignal = async (signal) => {
  // Split author into First/Last Name
  const nameParts = (signal.author || '').trim().split(' ');
  const firstName = nameParts[0] || 'Unknown';
  const lastName = nameParts.slice(1).join(' ') || 'Lead';
  const fullName = `${firstName} ${lastName}`;

  const fields = {
    'Full Name': fullName,
    'First Name': firstName,
    'Last Name': lastName,
    'Company': signal.company || '',
    'Pipeline status': 'New',
    'LinkedIn URL': signal.authorProfileUrl || '',
    'Intent score': parseInt(signal.intentScore) || 0,
    'Activity score': parseInt(signal.activityScore) || 0,
    'Final score': parseInt(signal.finalScore) || 0,
    'Level': signal.level || 'Cold',
    'Notes': `SOURCE: ${signal.platform || 'Unknown'}\nAI AUDIT REASON:\n${signal.reason || 'Not analyzed yet'}\n\nORIGINAL POST:\n${signal.postText || 'No text'}`
  };

  const path = `/${encodeURIComponent('Leads (CRM)')}`;

  try {
    return await secureAirtableRequest({ 
      method: 'POST', 
      path, 
      body: { fields } 
    });
  } catch (error) {
    console.error('Airtable Export Error:', error);
    throw error;
  }
};

export const updateLead = async (recordId, leadData) => {
  const path = `/${encodeURIComponent('Leads (CRM)')}/${recordId}`;
  
  const fields = {
    'Full Name': `${leadData.firstName || ''} ${leadData.lastName || ''}`.trim(),
    'First Name': leadData.firstName || '',
    'Last Name': leadData.lastName || '',
    'Company': leadData.company || '',
    'Pipeline status': leadData.status || 'New',
    'LinkedIn URL': leadData.profileUrl || '',
    'Title / Role': leadData.title || '',
    'Website': leadData.website || '',
    'Email': leadData.email || '',
    'Phone': leadData.phone || '',
    'Level': leadData.level || 'Cold',
    'Notes': leadData.notes || ''
  };

  try {
    return await secureAirtableRequest({
      method: 'PATCH',
      path,
      body: { fields }
    });
  } catch (error) {
    console.error('Airtable Lead Update Error:', error);
    throw error;
  }
};

export const deleteLead = async (recordId) => {
  const path = `/${encodeURIComponent('Leads (CRM)')}/${recordId}`;
  
  try {
    return await secureAirtableRequest({ method: 'DELETE', path });
  } catch (error) {
    console.error('Airtable Lead Delete Error:', error);
    throw error;
  }
};

export const createProspectInterest = async (prospectData) => {
  // En production (Vercel), on utilise la Serverless Function pour masquer la clé API
  if (import.meta.env.PROD) {
    try {
      const response = await fetch('/api/create-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prospectData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'enregistrement');
      }

      return await response.json();
    } catch (error) {
      console.error('Production Lead Error:', error);
      throw error;
    }
  }

  // Fallback pour le développement local (direct Airtable)
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent('Leads (CRM)')}`;
  
  const fields = {
    'Full Name': prospectData.name || 'Prospect Web',
    'Email': prospectData.email || '',
    'Company': prospectData.company || '',
    'Pipeline status': 'New',
    'Level': 'Warm',
    'Notes': `[DEBUG LOCAL] Intérêt site web.\nEntreprise: ${prospectData.company || 'N/A'}`
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fields })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to record prospect interest');
    }

    return await response.json();
  } catch (error) {
    console.error('Airtable Interesting Lead Error:', error);
    throw error;
  }
};
