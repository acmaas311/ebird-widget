export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const code = `(function () {
  const script = document.currentScript;
  const hotspot = script.getAttribute('data-hotspot');
  if (!hotspot) return;

  const host = document.createElement('div');
  host.id = 'ebird-widget-' + hotspot;
  host.style.cssText = 'display:block;width:100%;';
  script.parentNode.insertBefore(host, script.nextSibling);

  const shadow = host.attachShadow({ mode: 'open' });
  shadow.innerHTML = '<p style="font-size:13px;color:#888;font-family:inherit;">Loading recent sightings\u2026</p>';

  const CSS = \`
    *, *::before, *::after { box-sizing: border-box; }
    :host { display: block; }
    .ew-wrap { container-type: inline-size; }
    .ew { border:1px solid #d4e6c3; border-radius:8px; font-family:inherit; background:#f9fdf6; box-sizing:border-box; overflow:visible; color:#1a3a1a; }
    .ew-header { padding:1rem 1.25rem; border-bottom:1px solid #d4e6c3; overflow:visible; }
    .ew-header-left { margin-bottom:.75rem; }
    .ew-eyebrow { font-size:.7rem; color:#2d6a2d; font-weight:600; text-transform:uppercase; letter-spacing:.06em; margin-bottom:.4rem; }
    .ew-title { font-size:1.1rem; font-weight:700; margin:0; color:#1a3a1a; }
    .ew-title span { font-size:.85rem; font-weight:400; color:#666; margin-left:.4rem; }
    .ew-stat-groups { display:flex; gap:0; align-items:flex-start; flex-wrap:wrap; row-gap:.75rem; min-width:0; }
    .ew-stat-group { display:flex; flex-direction:column; gap:.35rem; }
    .ew-stat-group + .ew-stat-group { padding-left:1.25rem; margin-left:1.25rem; border-left:1px solid #d4e6c3; }
    .ew-stat-group-label { font-size:.65rem; font-weight:700; text-transform:uppercase; letter-spacing:.07em; color:#2d6a2d; display:flex; align-items:center; gap:.3rem; }
    .ew-stat-group-meta { font-size:.65rem; color:#aaa; font-weight:400; letter-spacing:0; text-transform:none; }
    .ew-stats { display:flex; gap:1rem; flex-wrap:wrap; }
    .ew-stat-num { font-size:1.2rem; font-weight:700; color:#2d6a2d; display:block; }
    .ew-stat-label { font-size:.68rem; color:#666; text-transform:uppercase; letter-spacing:.05em; }
    .ew-month-updated { font-size:.7rem; color:#aaa; margin-left:auto; }
    .ew-tip { position:relative; display:inline-flex; align-items:center; cursor:help; margin-left:.3rem; }
    .ew-tip-icon { font-size:.72rem; color:#aaa; line-height:1; }
    .ew-tip-box { display:none; position:absolute; z-index:99; top:calc(100% + 6px); left:50%; transform:translateX(-50%); background:#333; color:#fff; font-size:.72rem; line-height:1.45; padding:.45rem .6rem; border-radius:5px; width:210px; pointer-events:none; white-space:normal; }
    .ew-tip-box::after { content:''; position:absolute; bottom:100%; left:50%; transform:translateX(-50%); border:5px solid transparent; border-bottom-color:#333; }
    .ew-tip:hover .ew-tip-box { display:block; }
    .ew-body { padding:1rem 1.25rem; overflow:hidden; }
    .ew-cols { display:grid; grid-template-columns:1fr 1fr; gap:1.25rem; }
    .ew-stack { display:flex; flex-direction:column; gap:1.25rem; }
    @container (max-width: 400px) { .ew-cols { grid-template-columns:1fr; } }
    h4 { font-size:.7rem; font-weight:600; text-transform:uppercase; letter-spacing:.05em; color:#444; margin:0 0 .5rem; }
    ul { list-style:none; margin:0; padding:0; }
    li { display:flex; justify-content:space-between; align-items:baseline; padding:.3rem 0; border-bottom:1px solid #e8f0e2; font-size:.85rem; gap:.5rem; color:#1a3a1a; }
    li.notable { color:#b91c1c; font-weight:500; }
    .ew-count { color:#888; font-size:.78rem; flex-shrink:0; }
    .ew-obs-date { color:#aaa; font-size:.72rem; flex-shrink:0; }
    .ew-footer { padding:.75rem 1.25rem; border-top:1px solid #d4e6c3; display:flex; justify-content:space-between; align-items:center; }
    a.ew-link { font-size:.8rem; color:#2d6a2d; text-decoration:none; font-weight:600; }
    a.ew-link:hover { text-decoration:underline; }
    a.ew-checklist-link { color:#2d6a2d; text-decoration:none; font-size:.85rem; }
    a.ew-checklist-link:hover { text-decoration:underline; }
    .ew-powered { font-size:.7rem; color:#aaa; }
    .ew-empty { font-size:.85rem; color:#888; margin:0; }
  \`;

  const origin = script.src.split('/widget.js')[0];
  fetch(origin + '/api/ebird?hotspot=' + hotspot)
    .then(function(r) { return r.json(); })
    .then(function(data) {
      var recent = data.recent || [];
      var notable = data.notable || [];
      var checklists = data.checklists || [];
      var lastChecklist = data.lastChecklist;
      var hotspotName = data.hotspotName;
      var numSpeciesAllTime = data.numSpeciesAllTime;
      var numChecklistsAllTime = data.numChecklistsAllTime;
      var numEBirdersAllTime = data.numEBirdersAllTime;
      var monthLabel = data.monthLabel;
      var speciesThisMonth = data.speciesThisMonth;
      var checklistsThisMonth = data.checklistsThisMonth;
      var eBirdersThisMonth = data.eBirdersThisMonth;

      var html = '<div class="ew-wrap"><div class="ew">';

      html += '<div class="ew-header">';
      html += '<div class="ew-header-left">';
      html += '<div class="ew-eyebrow">Latest Data from eBird</div>';
      if (hotspotName) html += '<h3 class="ew-title">' + esc(hotspotName) + '</h3>';
      html += '</div>';
      html += '<div class="ew-stat-groups">';
      if (numSpeciesAllTime) {
        html += '<div class="ew-stat-group">';
        html += '<div class="ew-stat-group-label">All Time</div>';
        html += '<div class="ew-stats"><div><span class="ew-stat-num">' + numSpeciesAllTime.toLocaleString() + '</span><span class="ew-stat-label">Species</span></div></div>';
        html += '</div>';
      }
      html += '<div class="ew-stat-group">';
      html += '<div class="ew-stat-group-label">';
      if (monthLabel) html += monthLabel;
      html += '<span class="ew-tip"><span class="ew-tip-icon">\u24D8</span><span class="ew-tip-box">Figures come from the eBird API and may differ slightly from eBird\u2019s website, which applies additional quality filters.</span></span>';
      if (lastChecklist) html += '<span class="ew-stat-group-meta">Updated ' + formatDate(lastChecklist) + '</span>';
      html += '</div>';
      html += '<div class="ew-stats">';
      html += '<div><span class="ew-stat-num">' + speciesThisMonth + '</span><span class="ew-stat-label">Species</span></div>';
      html += '<div><span class="ew-stat-num">' + checklistsThisMonth + '</span><span class="ew-stat-label">Checklists</span></div>';
      html += '<div><span class="ew-stat-num">' + eBirdersThisMonth + '</span><span class="ew-stat-label">eBirders</span></div>';
      html += '</div></div>';
      html += '</div>';
      html += '</div>';

      html += '<div class="ew-body"><div class="ew-cols">';

      // Column 1: species list
      html += '<div><h4>Most Recent Species Recorded This Month</h4>';
      if (recent.length) {
        html += '<ul>';
        recent.slice(0, 10).forEach(function(b) {
          html += '<li><span>' + esc(b.comName) + '</span>' + (b.howMany ? '<span class="ew-count">' + b.howMany + '</span>' : '') + '</li>';
        });
        html += '</ul>';
      } else {
        html += '<p class="ew-empty">No sightings reported yet.</p>';
      }
      html += '</div>';

      // Column 2: rare birds stacked above recent checklists
      html += '<div class="ew-stack">';
      html += '<div><h4>\uD83D\uDD34 Rare Bird Alerts</h4>';
      if (notable.length) {
        html += '<ul>';
        notable.slice(0, 10).forEach(function(b) {
          html += '<li class="notable"><span>' + esc(b.comName) + '</span><span class="ew-obs-date">' + (b.obsDt || '').split(' ')[0] + '</span></li>';
        });
        html += '</ul>';
      } else {
        html += '<p class="ew-empty">No rare birds reported.</p>';
      }
      html += '</div>';

      html += '</div>'; // close right column

      html += '</div></div>';
      html += '<div class="ew-footer">';
      html += '<a class="ew-link" href="https://ebird.org/hotspot/' + hotspot + '" target="_blank" rel="noopener">View full data on eBird \u2192</a>';
      html += '<span class="ew-powered">Powered by eBird</span>';
      html += '</div>';
      html += '</div></div>';

      shadow.innerHTML = '<style>' + CSS + '</style>' + html;
    })
    .catch(function() {
      shadow.innerHTML = '<p style="font-size:13px;color:#888;">Sightings unavailable right now.</p>';
    });

  function formatDate(d) {
    var parts = d.split('-');
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return months[+parts[1] - 1] + ' ' + +parts[2] + ', ' + parts[0];
  }

  function esc(str) {
    return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
})();`;

  res.send(code);
}
