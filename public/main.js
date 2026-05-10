async function uploadFile(formData) {
  const res = await fetch('/upload', { method: 'POST', body: formData });
  return res.json();
}

async function fetchAds() {
  const r = await fetch('/ads');
  return r.json();
}

async function publishAll() {
  const r = await fetch('/publish-all', { method: 'POST' });
  return r.json();
}

async function publishOne(index) {
  const r = await fetch('/publish/' + index, { method: 'POST' });
  return r.json();
}

document.getElementById('uploadForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = document.getElementById('file');
  if (!f.files.length) return alert('اختر ملف');
  const fd = new FormData();
  fd.append('file', f.files[0]);
  const res = await uploadFile(fd);
  alert('Uploaded: ' + (res.count || 0));
  loadAds();
});

document.getElementById('refresh').addEventListener('click', loadAds);
document.getElementById('publishAll').addEventListener('click', async () => {
  if (!confirm('هل تريد نشر كل الإعلانات الآن؟')) return;
  const res = await publishAll();
  alert('Publish complete. Check logs for details.');
  loadAds();
});

async function loadAds() {
  const ads = await fetchAds();
  const el = document.getElementById('adsList');
  if (!ads || !ads.length) { el.innerText = 'لا توجد إعلانات محمّلة.'; return; }
  el.innerHTML = '';
  ads.forEach((a, i) => {
    const div = document.createElement('div');
    div.className = 'ad';
    div.innerHTML = `<strong>${escapeHtml(a.title)}</strong> — ${escapeHtml(a.price)}<br>${escapeHtml(a.description)}<br><small>account: ${escapeHtml(a.account)}</small> <br>`;
    const btn = document.createElement('button'); btn.innerText = 'نشر'; btn.addEventListener('click', async ()=>{ await publishOne(i); alert('done (see logs)'); });
    div.appendChild(btn);
    el.appendChild(div);
  });
  loadLogs();
}

function escapeHtml(s){ if(!s) return ''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

async function loadLogs() {
  try {
    const r = await fetch('/logs');
    if (!r.ok) return;
    const txt = await r.text();
    document.getElementById('logs').innerText = txt || 'لا يوجد سجل حتى الآن.';
  } catch (err) { console.error(err); }
}

// load at start
loadAds();
