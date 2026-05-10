const axios = require('axios');

const IG_ID = process.env.IG_BUSINESS_ACCOUNT_ID || '';
const PAGE_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN || '';

if (!IG_ID || !PAGE_TOKEN) {
  console.warn('IG_BUSINESS_ACCOUNT_ID or FB_PAGE_ACCESS_TOKEN not set. Instagram posting will fail until configured.');
}

const GRAPH = 'https://graph.facebook.com/v17.0';

async function postToInstagram(entry) {
  if (!IG_ID || !PAGE_TOKEN) throw new Error('Instagram Business Account ID or Page Access Token not configured');

  const caption = buildCaption(entry);
  const urlImages = (entry.images || []).filter(i => isUrl(i));
  if (urlImages.length === 0) {
    throw new Error('Instagram posting requires at least one image URL');
  }

  // Create media object
  const creationEndpoint = `${GRAPH}/${IG_ID}/media`;
  const creationParams = {
    image_url: urlImages[0],
    caption,
    access_token: PAGE_TOKEN
  };
  const createResp = await axios.post(creationEndpoint, null, { params: creationParams });
  const creationId = createResp.data.id;

  // Publish media
  const publishEndpoint = `${GRAPH}/${IG_ID}/media_publish`;
  const publishParams = {
    creation_id: creationId,
    access_token: PAGE_TOKEN
  };
  const publishResp = await axios.post(publishEndpoint, null, { params: publishParams });

  return { platform: 'instagram', creation: createResp.data, publish: publishResp.data };
}

function buildCaption(entry) {
  const parts = [];
  if (entry.title) parts.push(entry.title);
  if (entry.price) parts.push(`السعر: ${entry.price}`);
  if (entry.location) parts.push(`الموقع: ${entry.location}`);
  if (entry.description) parts.push('\n' + entry.description);
  return parts.join('\n');
}

function isUrl(s) {
  return typeof s === 'string' && /^https?:\/\//i.test(s);
}

module.exports = { postToInstagram };
