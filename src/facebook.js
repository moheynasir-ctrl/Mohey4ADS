const axios = require('axios');

const PAGE_ID = process.env.FB_PAGE_ID || '';
const PAGE_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN || '';

if (!PAGE_TOKEN || !PAGE_ID) {
  console.warn('FB_PAGE_ID or FB_PAGE_ACCESS_TOKEN not set. Facebook posting will fail until configured.');
}

const GRAPH = 'https://graph.facebook.com/v17.0';

async function postToFacebook(entry) {
  if (!PAGE_ID || !PAGE_TOKEN) throw new Error('Facebook Page ID or Access Token not configured');

  const caption = buildCaption(entry);
  // If images provided and look like URLs, post the first image with caption via /{page_id}/photos
  const urlImages = (entry.images || []).filter(i => isUrl(i));
  if (urlImages.length > 0) {
    // Use the first image to keep it simple
    const photoUrl = urlImages[0];
    const endpoint = `${GRAPH}/${PAGE_ID}/photos`;
    const params = {
      url: photoUrl,
      caption,
      access_token: PAGE_TOKEN
    };
    const resp = await axios.post(endpoint, null, { params });
    return { platform: 'facebook', method: 'photos', response: resp.data };
  }

  // Fallback to text post
  const feedEndpoint = `${GRAPH}/${PAGE_ID}/feed`;
  const feedParams = {
    message: caption,
    access_token: PAGE_TOKEN
  };
  const resp = await axios.post(feedEndpoint, null, { params: feedParams });
  return { platform: 'facebook', method: 'feed', response: resp.data };
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

module.exports = { postToFacebook };
