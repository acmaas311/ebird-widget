(function () {
  const script = document.currentScript;
  const hotspot = script.getAttribute('data-hotspot');
  if (!hotspot) return;

  const container = document.createElement('div');
  container.id = 'ebird-widget-' + hotspot;
  container.innerHTML = '<p style="font-size:13px;color:#888;">Loading recent sightings…</p>';
  script.parentNode.insertBefore(container, script.nextSibling);

  if (!document.getElementById('ebird-widget-styles')) {
    const style = document.createElement('style');
    style.id = 'ebird-widget-styles';
    style.textContent = `
      .ew-wrap { container-type: inline-size; }
      .ew { border:1px solid #d4e6c3; border-radius:8px; font-family:inherit; background:#f9fdf6; box-sizing:border-box; overflow:hidden; }
      .ew-header { padding:1rem 1.25rem; border-bottom:1px solid #d4e6c3; }
      .ew-eyebrow { font-size:.7rem; color:#2d6a2d; font-weight:600; text-transform:uppercase; letter-spacing:.06em; margin-bottom:.4rem; }
      .ew-title { font-size:1.1rem; font-weight:700; margin:0; color:#1a3a1a; }
      .ew-title span { font-size:.85rem; font-weight:400; color:#666; margin-left:.4rem; }
      .ew-alltime-note { font-size:.7rem; color:#aaa; margin:.4rem 0 0; }
      .ew-stats { display:flex; gap:2rem; margin:.75rem 0 0; flex-wrap:wrap; }
      .ew-stat-num { font-size:1.3rem; font-weight:700; color:#2d6a2d; display:block; }
      .ew-stat-label { font-size:.7rem; color:#666; text-transform:uppercase; letter-spacing:.05em; }
      .ew-month { padding:.75rem 1.25rem; border-bottom:1px solid #d4e6c3; background:#f0f7ec; }
      .ew-month-header { display:flex; align-items:baseline; gap:.5rem; margin-bottom:.5rem; flex-wrap:wrap; }
      .ew-month-title { font-size:.85rem; font-weight:700; color:#1a3a1a; }
      .ew-month-label { font-size:.75rem; color:#666; }
      .ew-month-updated { font-size:.7rem; color:#aaa; margin-left:auto; }
      .ew-body { padding:1rem 1.25rem; }
      .ew-cols { display:grid; grid-template-columns:1fr 1fr 1fr; gap:1.25rem; }
      @container (max-width: 600px) { .ew-cols { grid-template-columns:1fr 1fr; } }
      @container (max-width: 400px) { .ew-cols { grid-template-columns:1fr; } }
      .ew h4 { font-size:.7rem; font-weight:600; text-transform:uppercase; letter-spacing:.05em; color:#444; margin:0 0 .5rem; }
      .ew ul { list-style:none; margin:0; padding:0; }
      .ew li { display:flex; justify-content:space-between; align-items:baseline; padding:.3rem 0; border-bottom:1px solid #e8f0e2; font-size:.85rem; gap:.5rem; }
      .ew li.notable { color:#b91c1c; font-weight:500; }
      .ew .ew-count { color:#888; font-size:.78rem; flex-shrink:0; }
      .ew .ew-obs-date { color:#aaa; font-size:.72rem; flex-shrink:0; }
      .ew-footer { padding:.75rem 1.25rem; border-top:1px solid #d4e6c3; display:flex; justify-content:space-between; align-items:center; }
      .ew a.ew-link { font-size:.8rem; color:#2d6a2d; text-decoration:none; font-weight:600; }
      .ew a.ew-link:hover { text-decoration:underline; }
      .ew a.ew-checklist-link { color:#2d6a2d; text-decoration:none; font-size:.85rem; }
      .ew a.ew-checklist-link:hover { text-decoration:underline; }
      .ew-powered { font-size:.7rem; color:#aaa; }
      .ew-empty { font-size:.85rem; color:#888; margin:0; }
    `;
    document.head.appendChild(style);
  }

  const origin = script.src.split('/widget.js')[0];
  fetch(`${origin}/api/ebird?hotspot=${hotspot}`)
    .then(r => r.json())
    .then(data => {
      const {
        recent = [], notable = [], checklists = [],
        lastChecklist, hotspotName,
        numSpeciesAllTime, numChecklistsAllTime, numEBirdersAllTime,
        monthLabel, speciesThisMonth, checklistsThisMonth, eBirdersThisMonth
      } = data;

      let html = '<div class="ew-wrap"><div class="ew">';

      // All-time header
      html += '<div class="ew-header">';
      html += '<div class="ew-eyebrow">Latest Data from eBird</div>';
      if (hotspotName) html += `<h3 class="ew-title">${esc(hotspotName)}</h3>`;
      html += '<div class="ew-stats">';
      if (numSpeciesAllTime)    html += `<div><span class="ew-stat-num">${numSpeciesAllTime.toLocaleString()}</span><span class="ew-stat-label">Species</span></div>`;
      if (numChecklistsAllTime) html += `<div><span class="ew-stat-num">${numChecklistsAllTime.toLocaleString()}</span><span class="ew-stat-label">Checklists</span></div>`;
      if (numEBirdersAllTime)   html += `<div><span class="ew-stat-num">${numEBirdersAllTime.toLocaleString()}</span><span class="ew-stat-label">eBirders</span></div>`;
      html += '</div>';
      html += '<p class="ew-alltime-note">All-time totals</p>';
      html += '</div>';

      // This month
      html += '<div class="ew-month">';
      html += '<div class="ew-month-header">';
      html += '<span class="ew-month-title">eBirding This Month</span>';
      if (monthLabel) html += `<span class="ew-month-label">${monthLabel}</span>`;
      if (lastChecklist) html += `<span class="ew-month-updated">Updated ${formatDate(lastChecklist)}</span>`;
      html += '</div>';
      html += '<div class="ew-stats">';
      html += `<div><span class="ew-stat-num" style="font-size:1rem;">${speciesThisMonth}</span><span class="ew-stat-label">Species</span></div>`;
      html += `<div><span class="ew-stat-num" style="font-size:1rem;">${checklistsThisMonth}</span><span class="ew-stat-label">Checklists</span></div>`;
      html += `<div><span class="ew-stat-num" style="font-size:1rem;">${eBirdersThisMonth}</span><span class="ew-stat-label">eBirders</span></div>`;
      html += '</div></div>';

      // 3-column body
      html += '<div class="ew-body"><div class="ew-cols">';

      // Col 1: Rare alerts
      html += '<div><h4>🔴 Rare Bird Alerts</h4>';
      if (notable.length) {
        html += '<ul>';
        notable.slice(0, 10).forEach(b => {
          html += `<li class="notable"><span>${esc(b.comName)}</span><span class="ew-obs-date">${(b.obsDt || '').split(' ')[0]}</span></li>`;
        });
        html += '</ul>';
      } else {
        html += '<p class="ew-empty">No rare birds reported.</p>';
      }
      html += '</div>';

      // Col 2: Species this month
      html += '<div><h4>Species This Month</h4>';
      if (recent.length) {
        html += '<ul>';
        recent.slice(0, 20).forEach(b => {
          html += `<li><span>${esc(b.comName)}</span>${b.howMany ? `<span class="ew-count">${b.howMany}</span>` : ''}</li>`;
        });
        html += '</ul>';
      } else {
        html += '<p class="ew-empty">No sightings reported yet.</p>';
      }
      html += '</div>';

      // Col 3: Recent checklists
      html += '<div><h4>Recent Checklists</h4>';
      if (checklists.length) {
        html += '<ul>';
        checklists.forEach(c => {
          const date  = c.obsDt ? formatDate(c.obsDt.split(' ')[0]) : '';
          const name  = esc(c.userDisplayName || 'eBirder');
          const count = c.numSpecies ? `${c.numSpecies} sp.` : '';
          const url   = c.subId ? `https://ebird.org/checklist/${c.subId}` : `https://ebird.org/hotspot/${hotspot}`;
          html += `<li><a class="ew-checklist-link" href="${url}" target="_blank" rel="noopener">${name}</a><span class="ew-count">${count}${date ? ' · ' + date : ''}</span></li>`;
        });
        html += '</ul>';
      } else {
        html += '<p class="ew-empty">No recent checklists.</p>';
      }
      html += '</div>';

      html += '</div></div>'; // end cols + body

      // Footer
      html += '<div class="ew-footer">';
      html += `<a class="ew-link" href="https://ebird.org/hotspot/${hotspot}" target="_blank" rel="noopener">View full data on eBird →</a>`;
      html += '<span class="ew-powered">Powered by eBird</span>';
      html += '</div>';

      html += '</div></div>'; // end .ew + .ew-wrap
      container.innerHTML = html;
    })
    .catch(() => {
      container.innerHTML = '<p style="font-size:13px;color:#888;">Sightings unavailable right now.</p>';
    });

  function formatDate(d) {
    const [y, m, day] = d.split('-');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[+m - 1]} ${+day}, ${y}`;
  }

  function esc(str) {
    return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
})();
