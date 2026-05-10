const fs = require('fs');
const path = require('path');
const axios = require('axios');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

if (!BOT_TOKEN) {
  console.warn('Warning: TELEGRAM_BOT_TOKEN is not set. Telegram publishing will fail until you set it in .env');
}

const API_BASE = token => `https://api.telegram.org/bot${token}`;

async function sendMessage(chatId, text) {
  const url = `${API_BASE(BOT_TOKEN)}/sendMessage`;
  return axios.post(url, { chat_id: chatId, text, parse_mode: 'HTML' });
}

async function sendPhoto(chatId, photoUrl, caption) {
  const url = `${API_BASE(BOT_TOKEN)}/sendPhoto`;
  return axios.post(url, { chat_id: chatId, photo: photoUrl, caption, parse_mode: 'HTML' });
}

async function sendMediaGroup(chatId, media) {
  const url = `${API_BASE(BOT_TOKEN)}/sendMediaGroup`;
  return axios.post(url, { chat_id: chatId, media });
}

module.exports = {
  postAdToTelegram: async (entry, overrideChatId) => {
    if (!BOT_TOKEN) throw new Error('Telegram bot token not configured');
    const chatId = overrideChatId || entry.account || process.env.TELEGRAM_DEFAULT_CHAT_ID;
    if (!chatId) throw new Error('No chat_id provided (entry.account or TELEGRAM_DEFAULT_CHAT_ID)');

    const textParts = [];
    if (entry.title) textParts.push(`<b>${escapeHtml(entry.title)}</b>`);
    if (entry.price) textParts.push(`<b>السعر:</b> ${escapeHtml(entry.price)}`);
    if (entry.location) textParts.push(`<b>الموقع:</b> ${escapeHtml(entry.location)}`);
    if (entry.description) textParts.push('\n' + escapeHtml(entry.description));

    const caption = textParts.join('\n');

    // If images are provided and look like URLs, try to send media group
    if (entry.images && entry.images.length > 0) {
      const urlImages = entry.images.filter(i => isUrl(i));
      if (urlImages.length === 1) {
        await sendPhoto(chatId, urlImages[0], caption);
        return { ok: true, method: 'sendPhoto' };
      } else if (urlImages.length > 1) {
        const media = urlImages.map((u, i) => ({ type: 'photo', media: u, caption: i === 0 ? caption : undefined }));
        await sendMediaGroup(chatId, media);
        return { ok: true, method: 'sendMediaGroup' };
      }
    }

    // Fallback to text message
    await sendMessage(chatId, caption);
    return { ok: true, method: 'sendMessage' };
  }
};

function escapeHtml(s) {
  if (!s) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function isUrl(s) {
  return typeof s === 'string' && /^https?:\/\//i.test(s);
}
