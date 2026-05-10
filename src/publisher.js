const fs = require('fs');
const path = require('path');
const pLimit = require('p-limit');
const telegram = require('./telegram');

const DATA_DIR = path.join(__dirname, '..', 'data');
const LOG_DIR = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });

const ADS_FILE = path.join(DATA_DIR, 'ads.json');
const LOG_FILE = path.join(LOG_DIR, 'posts.log');

function getAds() {
  try {
    if (!fs.existsSync(ADS_FILE)) return [];
    const raw = fs.readFileSync(ADS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read ads:', err);
    return [];
  }
}

async function publishOne(index) {
  const ads = getAds();
  if (!ads[index]) throw new Error('Index out of range');
  const entry = ads[index];
  const result = await attemptPublish(entry);
  return result;
}

async function publishAll() {
  const ads = getAds();
  const limit = pLimit(3); // concurrent publishes
  const results = await Promise.all(ads.map((ad, idx) => limit(() => attemptPublish(ad, idx))));
  return { count: results.length, results };
}

async function attemptPublish(entry, idx = null) {
  const maxRetries = 2;
  let lastErr = null;
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      // For MVP we only support Telegram (Bot API). If account looks like chat_id or override provided.
      const res = await telegram.postAdToTelegram(entry);
      const log = makeLog(entry, true, null, res);
      appendLog(log);
      return { success: true, log };
    } catch (err) {
      lastErr = err;
      const reason = String(err.message || err);
      const log = makeLog(entry, false, reason, null);
      appendLog(log);
      // simple backoff
      await new Promise(r => setTimeout(r, 1000 * attempt));
    }
  }
  return { success: false, error: String(lastErr) };
}

function makeLog(entry, success, error, meta) {
  return {
    timestamp: new Date().toISOString(),
    success: !!success,
    error: error || null,
    meta: meta || null,
    entry: {
      title: entry.title,
      account: entry.account,
      schedule: entry.schedule || null
    }
  };
}

function appendLog(log) {
  try {
    fs.appendFileSync(LOG_FILE, JSON.stringify(log) + '\n');
  } catch (err) {
    console.error('Failed to write log:', err);
  }
}

module.exports = { getAds, publishAll, publishOne };
