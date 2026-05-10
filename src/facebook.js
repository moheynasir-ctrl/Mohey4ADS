const fs = require('fs');
const path = require('path');
const axios = require('axios');

const PAGE_ID = process.env.FB_PAGE_ID || '';
const PAGE_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN || '';

if (!PAGE_TOKEN) {
  console.warn('Warning: FB_PAGE_ACCESS_TOKEN is not set. Facebook publishing will fail until you set it in .env');
}

const API_BASE = 'https://graph.facebook.com/v15.0';

async function postToFacebook(entry) {
  if (!PAGE_TOKEN) throw new Error('FB_PAGE_ACCESS_TOKEN not configured');
  const pageId = entry.account || PAGE_ID;
  if (!pageId) throw new Error('No FB page id provided (entry.account or FB_PAGE_ID)');

  const messageParts = [];
  if (entry.title) messageParts.push(entry.title);
  if (entry.price) messageParts.push(`السعر: ${entry.price}`);
  if (entry.location) messageParts.push(`الموقع: ${entry.location}`);
  if (entry.description) messageParts.push(entry.description);
  const message = messageParts.join('\n');

  // If images are provided, upload them as photos (will create posts for each photo unless combined)
  if (entry.images && entry.images.length > 0) {
    // For simplicity: if one image => upload photo with message; if multiple, upload each without message except first
    for (let i = 0; i < entry.images.length; i++) {
      const url = entry.images[i];
      const params = new URLSearchParams();
      params.append('url', url);
      if (i === 0) params.append('caption', message);
      params.append('access_token', PAGE_TOKEN);
      const res = await axios.post(`${API_BASE}/${pageId}/photos`, params);
      // res.data contains id
    }
    return { ok: true, method: 'photos' };
  }

  // Fallback: simple text post
  const params = new URLSearchParams();
  params.append('message', message);
  params.append('access_token', PAGE_TOKEN);
  const res = await axios.post(`${API_BASE}/${pageId}/feed`, params);
  return { ok: true, method: 'feed', data: res.data };
}

module.exports = { postToFacebook };
