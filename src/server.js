const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { publishAll, publishOne, getAds } = require('./publisher');
const cron = require('node-cron');

require('dotenv').config();

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const upload = multer({ dest: UPLOAD_DIR });
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.json());

// Upload endpoint (CSV or JSON)
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const ext = path.extname(req.file.originalname).toLowerCase();
    const raw = fs.readFileSync(req.file.path, 'utf8');
    let ads = [];
    if (ext === '.csv') {
      const records = parse(raw, { columns: true, skip_empty_lines: true });
      ads = records.map(r => ({
        title: r.title || '',
        description: r.description || '',
        price: r.price || '',
        images: (r.images || '').split('|').map(s => s.trim()).filter(Boolean),
        location: r.location || '',
        account: r.account || '',
        platform: (r.platform || 'facebook').toLowerCase(),
        schedule: r.schedule || '',
        published: false
      }));
    } else if (ext === '.json') {
      ads = JSON.parse(raw).map(a => ({ ...a, platform: (a.platform || 'facebook').toLowerCase(), images: a.images || [], published: !!a.published }));
    } else {
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    const dataPath = path.join(DATA_DIR, 'ads.json');
    fs.writeFileSync(dataPath, JSON.stringify(ads, null, 2));
    return res.json({ message: 'Uploaded', count: ads.length, ads });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: String(err) });
  }
});

app.get('/ads', (req, res) => {
  const ads = getAds();
  res.json(ads);
});

app.post('/publish-all', async (req, res) => {
  try {
    const result = await publishAll();
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
});

app.post('/publish/:index', async (req, res) => {
  const idx = Number(req.params.index);
  try {
    const result = await publishOne(idx);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
});

app.get('/logs', (req, res) => {
  try {
    const logPath = path.join(__dirname, '..', 'logs', 'posts.log');
    if (!fs.existsSync(logPath)) return res.status(200).send('');
    const txt = fs.readFileSync(logPath, 'utf8');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(txt);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to read logs');
  }
});

// Scheduler: check every minute for scheduled ads
cron.schedule('* * * * *', async () => {
  try {
    const ads = getAds();
    const now = new Date();
    for (let i = 0; i < ads.length; i++) {
      const ad = ads[i];
      if (ad.published) continue;
      if (!ad.schedule) continue;
      const sched = new Date(ad.schedule);
      if (!isNaN(sched.getTime()) && sched <= now) {
        console.log('Scheduled publish for index', i, ad.title);
        await publishOne(i);
      }
    }
  } catch (err) {
    console.error('Scheduler error:', err);
  }
});

app.listen(PORT, () => {
  console.log(`Mohey4ADS server listening on http://localhost:${PORT}`);
});
