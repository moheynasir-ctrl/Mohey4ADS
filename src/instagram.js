const axios = require('axios');

const PAGE_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN || '';
const IG_USER_ID = process.env.IG_BUSINESS_ACCOUNT_ID || '';
const API_BASE = 'https://graph.facebook.com/v15.0';

if (!PAGE_TOKEN) console.warn('Warning: FB_PAGE_ACCESS_TOKEN is not set. Instagram publishing will fail until you set it in .env');
if (!IG_USER_ID) console.warn('Warning: IG_BUSINESS_ACCOUNT_ID is not set. Instagram publishing will fail until you set it in .env');

async function postToInstagram(entry) {
  if (!PAGE_TOKEN) throw new Error('FB_PAGE_ACCESS_TOKEN not configured');
  if (!IG_USER_ID) throw new Error('IG_BUSINESS_ACCOUNT_ID not configured');

  // Instagram Graph API requires media_url (publicly accessible). We support only image URLs for MVP.
  if (!entry.images || !entry.images.length) throw new Error('Instagram requires at least one image URL');
  const imageUrl = entry.images[0];
  const captionParts = [];
  if (entry.title) captionParts.push(entry.title);
  if (entry.price) captionParts.push(`السعر: ${entry.price}`);
  if (entry.location) captionParts.push(`الموقع: ${entry.location}`);
  if (entry.description) captionParts.push(entry.description);
  const caption = captionParts.join('\n');

  // Create media object
  const createRes = await axios.post(`${API_BASE}/${IG_USER_ID}/media`, null, {
    params: {
      image_url: imageUrl,
      caption,
      access_token: PAGE_TOKEN
    }
  });
  const creationId = createRes.data && createRes.data.id;
  if (!creationId) throw new Error('Failed to create IG media');

  // Publish
  const publishRes = await axios.post(`${API_BASE}/${IG_USER_ID}/media_publish`, null, {
    params: { creation_id: creationId, access_token: PAGE_TOKEN }
  });

  return { ok: true, method: 'instagram_media_publish', data: publishRes.data };
}

module.exports = { postToInstagram };
