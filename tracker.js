/* YDT.TECH – מדידת כניסות ולחיצות (נשלח לגוגל שיטס) */
(function () {
  // כתובת ה-Web app של Apps Script (מסתיימת ב-/exec). ריק = המדידה כבויה.
  var LOG_URL = 'https://script.google.com/macros/s/AKfycbzBNcQXP4x-ZrisZK9GiMl7nmaTpB8qJw6dbk6CA0wj2Xgv-ia8ja0bYMd3jvK2daHphA/exec';

  var q = location.search;
  try {
    if (/[?&]notrack=1/.test(q)) localStorage.setItem('ydt_notrack', '1');
    if (/[?&]notrack=0/.test(q)) localStorage.removeItem('ydt_notrack');
  } catch (e) {}
  var off = false;
  try { off = localStorage.getItem('ydt_notrack') === '1'; } catch (e) {}

  function rid() { return Math.random().toString(36).slice(2, 10); }
  var vid, returning = false;
  try {
    vid = localStorage.getItem('ydt_vid');
    if (vid) returning = true; else { vid = rid(); localStorage.setItem('ydt_vid', vid); }
  } catch (e) { vid = rid(); }

  var sid = rid(), t0 = Date.now(), ua = navigator.userAgent;
  var device = /iPad|Tablet/i.test(ua) ? 'טאבלט' : (/Mobi|Android|iPhone/i.test(ua) ? 'נייד' : 'מחשב');
  var browser = /Edg\//.test(ua) ? 'Edge' : /SamsungBrowser/.test(ua) ? 'Samsung' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'אחר';
  var os = /Windows/.test(ua) ? 'Windows' : /Android/.test(ua) ? 'Android' : /iPhone|iPad|iPod/.test(ua) ? 'iOS' : /Mac OS/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : 'אחר';
  var params = new URLSearchParams(location.search);
  var utm = ['utm_source', 'utm_medium', 'utm_campaign'].map(function (k) { return params.get(k); }).filter(Boolean).join(' / ');
  var ref = 'כניסה ישירה';
  if (document.referrer) { try { ref = new URL(document.referrer).hostname; } catch (e) { ref = document.referrer; } }

  function send(ev, details) {
    if (off || !LOG_URL) return;
    var body = JSON.stringify({
      event: ev, details: details || '', vid: vid, returning: returning, sid: sid,
      device: device, browser: browser, os: os, screen: screen.width + '×' + screen.height,
      lang: navigator.language, referrer: ref, utm: utm, page: location.pathname,
      seconds: Math.round((Date.now() - t0) / 1000)
    });
    try {
      if (navigator.sendBeacon && navigator.sendBeacon(LOG_URL, new Blob([body], { type: 'text/plain' }))) return;
    } catch (e) {}
    try { fetch(LOG_URL, { method: 'POST', mode: 'no-cors', keepalive: true, headers: { 'Content-Type': 'text/plain' }, body: body }); } catch (e) {}
  }
  window.ydtTrack = send;

  send('כניסה לאתר');

  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest ? e.target.closest('a,button') : null;
    if (!el) return;
    var text = (el.getAttribute('aria-label') || el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60);
    var href = el.getAttribute('href') || '';
    send('לחיצה', text + (href ? ' (' + href + ')' : ''));
  }, true);

  var names = { machine: 'הדמיה', services: 'שירותים', contact: 'יצירת קשר' };
  var seen = {};
  setTimeout(function () {
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var id = en.target.id;
        if (en.isIntersecting && !seen[id]) { seen[id] = 1; send('צפייה בחלק', names[id] || id); io.unobserve(en.target); }
      });
    }, { threshold: 0.35 });
    Object.keys(names).forEach(function (id) { var el = document.getElementById(id); if (el) io.observe(el); });
  }, 1500);

  var left = false;
  function leave() {
    if (left) return;
    left = true;
    send('יציאה מהאתר', 'זמן שהייה: ' + Math.round((Date.now() - t0) / 1000) + ' שניות');
  }
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') leave(); });
  window.addEventListener('pagehide', leave);
})();
