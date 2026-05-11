const File = require('../models/File');
const AccessLog = require('../models/AccessLog');
const { decrypt } = require('../utils/crypto');
const { getServerBase } = require('../utils/getIP');

const esc = (s) => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const fmtSize = (b) => {
  if (!b) return 'Unknown';
  if (b < 1024) return b + ' B';
  if (b < 1048576) return (b/1024).toFixed(1) + ' KB';
  return (b/1048576).toFixed(1) + ' MB';
};
const fileIcon = (mime) => {
  if (!mime) return '📄';
  if (mime.startsWith('image/')) return '🖼️';
  if (mime === 'application/pdf') return '📕';
  if (mime.includes('word')) return '📝';
  if (mime.includes('sheet') || mime.includes('excel')) return '📊';
  if (mime.includes('zip')) return '🗜️';
  if (mime.startsWith('video/')) return '🎬';
  return '📄';
};

const errorPage = (title, msg) => `<!DOCTYPE html>
<html><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${title}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui,sans-serif;background:#0f0f1a;color:#e2e8f0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}.card{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:20px;padding:48px 36px;text-align:center;max-width:420px;width:100%}h2{color:#f87171;font-size:22px;margin:16px 0 8px}p{color:#64748b;font-size:14px;line-height:1.6}</style>
</head><body><div class="card"><div style="font-size:64px">⚠️</div><h2>${title}</h2><p>${msg}</p></div></body></html>`;

// GET /api/file-access/:token — QR scans land here, serves full HTML page
exports.serveAccessPage = async (req, res) => {
  try {
    const file = await File.findOne({ token: req.params.token });
    if (!file) return res.status(404).send(errorPage('File Not Found', 'This link is invalid or the file has been deleted.'));
    if (file.expiresAt && new Date() > file.expiresAt) return res.status(410).send(errorPage('Link Expired', 'This QR code link has expired.'));
    if (file.oneTimeAccess && file.accessed) return res.status(410).send(errorPage('Already Used', 'This one-time access link has already been used.'));

    const base = getServerBase();

    res.setHeader('Content-Type', 'text/html');
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Secure File Access</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Segoe UI',system-ui,sans-serif;background:#0f0f1a;color:#e2e8f0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}
    .bg1{position:fixed;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle,rgba(99,102,241,.2) 0%,transparent 70%);top:-150px;left:-150px;pointer-events:none}
    .bg2{position:fixed;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle,rgba(139,92,246,.2) 0%,transparent 70%);bottom:-150px;right:-150px;pointer-events:none}
    .card{background:rgba(255,255,255,.05);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.1);border-radius:20px;padding:40px 32px;width:100%;max-width:460px;position:relative;z-index:1;animation:fadeIn .5s ease}
    @keyframes fadeIn{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
    .logo{font-size:54px;text-align:center;margin-bottom:10px}
    h1{font-size:24px;font-weight:700;text-align:center;color:#f1f5f9}
    .sub{font-size:14px;color:#64748b;text-align:center;margin-top:6px;margin-bottom:26px}
    .file-box{background:rgba(99,102,241,.09);border:1px solid rgba(99,102,241,.22);border-radius:12px;padding:16px 18px;margin-bottom:24px;display:flex;align-items:center;gap:14px}
    .file-icon{font-size:34px;flex-shrink:0}
    .file-name{font-size:15px;font-weight:600;color:#e2e8f0;word-break:break-all;line-height:1.4}
    .file-meta{font-size:12px;color:#64748b;margin-top:3px}
    label{display:block;font-size:13px;font-weight:500;color:#94a3b8;margin-bottom:8px}
    .inp-wrap{position:relative;margin-bottom:14px}
    input{width:100%;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.13);border-radius:10px;padding:13px 48px 13px 16px;color:#e2e8f0;font-size:15px;outline:none;transition:border-color .25s,box-shadow .25s;-webkit-appearance:none;appearance:none}
    input:focus{border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,.18)}
    input::placeholder{color:#475569}
    .eye{position:absolute;right:13px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;font-size:19px;padding:0;line-height:1}
    .btn{width:100%;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;padding:14px;border-radius:10px;font-size:15px;font-weight:700;cursor:pointer;transition:transform .2s,box-shadow .2s;display:flex;align-items:center;justify-content:center;gap:8px;-webkit-appearance:none;appearance:none}
    .btn:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(99,102,241,.4)}
    .btn:disabled{opacity:.6;cursor:not-allowed;transform:none;box-shadow:none}
    .spinner{width:18px;height:18px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;display:inline-block;flex-shrink:0}
    @keyframes spin{to{transform:rotate(360deg)}}
    .err{background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.28);color:#f87171;padding:11px 15px;border-radius:10px;font-size:14px;margin-bottom:14px;display:none}
    .success{display:none;flex-direction:column;gap:14px}
    .ok-banner{display:flex;align-items:center;justify-content:center;gap:10px;background:rgba(34,197,94,.12);border:1px solid rgba(34,197,94,.25);color:#4ade80;padding:14px 20px;border-radius:12px;font-weight:700;font-size:16px}
    .dl-btn{display:flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;padding:14px 24px;border-radius:12px;text-decoration:none;font-weight:700;font-size:15px;box-shadow:0 8px 24px rgba(99,102,241,.35)}
    .preview-label{font-size:12px;color:#64748b;margin-bottom:8px;font-weight:500}
    img.prev{max-width:100%;border-radius:10px;display:block}
    iframe.prev{width:100%;height:420px;border:none;border-radius:10px}
  </style>
</head>
<body>
<div class="bg1"></div><div class="bg2"></div>
<div class="card">
  <div class="logo">🔐</div>
  <h1>Secure File Access</h1>
  <p class="sub">This file is password protected</p>
  <div class="file-box">
    <div class="file-icon">${fileIcon(file.mimeType)}</div>
    <div>
      <div class="file-name">${esc(file.originalName)}</div>
      <div class="file-meta">${fmtSize(file.fileSize)} &middot; ${esc(file.mimeType || 'Unknown')}</div>
    </div>
  </div>
  <div id="err" class="err"></div>
  <div id="formSection">
    <label>🔑 Enter File Password</label>
    <div class="inp-wrap">
      <input id="pwd" type="password" placeholder="Enter password to unlock this file" autocomplete="current-password"/>
      <button class="eye" type="button" onclick="togglePwd()" id="eyeBtn">👁️</button>
    </div>
    <button class="btn" id="unlockBtn" onclick="unlock()">🔓 Unlock &amp; Access File</button>
  </div>
  <div class="success" id="successSection">
    <div class="ok-banner"><span>✅</span><span>Access Granted!</span></div>
    <a id="dlBtn" class="dl-btn" href="#" target="_blank">⬇️ Download File</a>
    <div id="previewArea"></div>
  </div>
</div>
<script>
  const TOKEN = '${req.params.token}';
  const SERVER = '${base}';
  function togglePwd(){
    const i=document.getElementById('pwd'),b=document.getElementById('eyeBtn');
    i.type=i.type==='password'?'text':'password';
    b.textContent=i.type==='password'?'👁️':'🙈';
  }
  document.getElementById('pwd').addEventListener('keydown',e=>{if(e.key==='Enter')unlock();});
  async function unlock(){
    const pwd=document.getElementById('pwd').value.trim();
    const errEl=document.getElementById('err');
    errEl.style.display='none';
    if(!pwd){showErr('Please enter the password');return;}
    const btn=document.getElementById('unlockBtn');
    btn.disabled=true;
    btn.innerHTML='<span class="spinner"></span> Verifying...';
    try{
      const res=await fetch(SERVER+'/api/file-access/'+TOKEN+'/verify',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({password:pwd})
      });
      const data=await res.json();
      if(!res.ok){
        showErr(data.message||'Incorrect password');
        btn.disabled=false;
        btn.innerHTML='🔓 Unlock &amp; Access File';
        return;
      }
      document.getElementById('formSection').style.display='none';
      const ss=document.getElementById('successSection');
      ss.style.display='flex';
      const dlBtn=document.getElementById('dlBtn');
      dlBtn.href=data.fileUrl;
      dlBtn.setAttribute('download',data.originalName);
      dlBtn.textContent='⬇️ Download '+data.originalName;
      const mime=data.mimeType||'';
      const pa=document.getElementById('previewArea');
      if(mime.startsWith('image/')){
        pa.innerHTML='<p class="preview-label">Preview</p><img class="prev" src="'+data.fileUrl+'" alt="preview"/>';
      } else if(mime==='application/pdf'){
        pa.innerHTML='<p class="preview-label">PDF Preview</p><iframe class="prev" src="'+data.fileUrl+'"></iframe>';
      }
    }catch(e){
      showErr('Network error. Make sure your device is on the same WiFi network.');
      btn.disabled=false;
      btn.innerHTML='🔓 Unlock &amp; Access File';
    }
  }
  function showErr(msg){
    const el=document.getElementById('err');
    el.textContent=msg;
    el.style.display='block';
  }
</script>
</body>
</html>`);
  } catch (err) {
    res.status(500).send(errorPage('Server Error', err.message));
  }
};

// POST /api/file-access/:token/verify
exports.verifyPassword = async (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  try {
    const file = await File.findOne({ token: req.params.token });
    if (!file) return res.status(404).json({ message: 'File not found' });
    if (file.expiresAt && new Date() > file.expiresAt) return res.status(410).json({ message: 'Link has expired' });
    if (file.oneTimeAccess && file.accessed) return res.status(410).json({ message: 'Link already used' });

    const isValid = decrypt(file.encryptedPassword) === req.body.password;
    await AccessLog.create({ fileId: file._id, ip, userAgent: req.headers['user-agent'], success: isValid });

    if (!isValid) return res.status(401).json({ message: 'Incorrect password' });

    file.scanCount += 1;
    if (file.oneTimeAccess) file.accessed = true;
    await file.save();

    const base = getServerBase();
    res.json({
      message: 'Access granted',
      fileUrl: `${base}/uploads/${file.filename}`,
      originalName: file.originalName,
      mimeType: file.mimeType,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/file-access/:token/info — for React dashboard
exports.getFileInfo = async (req, res) => {
  try {
    const file = await File.findOne({ token: req.params.token });
    if (!file) return res.status(404).json({ message: 'File not found' });
    res.json({ originalName: file.originalName, mimeType: file.mimeType, fileSize: file.fileSize });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
