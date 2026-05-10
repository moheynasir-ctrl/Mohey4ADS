const fs = require('fs');
const path = require('path');
const pLimit = require('p-limit');
const cron = require('node-cron');
const facebook = require('./facebook');
const instagram = require('./instagram');
// telegram.js kept as reference but not used by default
// const telegram = require('./telegram');

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
      let res = null;
      const platform = (entry.platform || 'facebook').toLowerCase();
      if (platform === 'instagram') {
        res = await instagram.postToInstagram(entry);
      } else if (platform === 'facebook') {
        res = await facebook.postToFacebook(entry);
      } else if (platform === 'telegram') {
        // kept for reference; if someone sets platform=telegram we'll attempt Telegram
        const telegram = require('./telegram');
        res = await telegram.postAdToTelegram(entry);
      } else {
        throw new Error('Unsupported platform: ' + platform);
      }

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
      platform: entry.platform || 'facebook',
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

// Scheduler: supports two types of schedule formats
// - ISO datetime (e.g. 2026-05-12T10:00:00Z): one-time schedule
// - cron expression (e.g. '0 9 * * *'): recurring schedule via node-cron

const scheduledJobs = [];

function initScheduler() {
  // clear previous jobs
  scheduledJobs.forEach(j => { try { j.stop && j.stop(); } catch (e) {} });
  scheduledJobs.length = 0;

  const ads = getAds();
  ads.forEach((entry, idx) => {
    if (!entry.schedule) return;
    const s = entry.schedule.trim();
    // simple heuristic: if contains spaces and 5 or 6 parts -> cron
    const parts = s.split(/\s+/);
    if (parts.length >= 5 && parts.length <= 6) {
      try {
        const job = cron.schedule(s, async () => {
          console.log('Cron job firing for ad index', idx);
          await attemptPublish(entry, idx);
        });
        scheduledJobs.push(job);
      } catch (e) {
        console.warn('Invalid cron expression for entry:', s, e.message);
      }
    } else {
      // try ISO datetime
      const when = new Date(s);
      if (!isNaN(when.getTime())) {
        const now = Date.now();
        const delay = when.getTime() - now;
        if (delay > 0) {
          const t = setTimeout(async () => {
            await attemptPublish(entry, idx);
          }, delay);
          scheduledJobs.push({ stop: () => clearTimeout(t) });
        }
      } else {
        console.warn('Unknown schedule format, skipping:', s);
      }
    }
  });
}

module.exports = { getAds, publishAll, publishOne, initScheduler };
