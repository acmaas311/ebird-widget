(function () {
  const script = document.currentScript;
  const hotspot = script.getAttribute('data-hotspot');
  if (!hotspot) return;

  // Inject a container div right after the script tag
  const container = document.createElement('div');
  container.id = 'ebird-widget-' + hotspot;
  container.innerHTML = '<p style="font-size:13px;color:#888;">Loading recent sightings…</p>';
  script.parentNode.insertBefore(container, script.nextSibling);

  // Inject styles once
  if (!document.getElementById('ebird-widget-styles')) {
    const style = document.createElement('style');
    style.id = 'ebird-widget-styles';
    style.textContent = `
      .ebird-widget { border:1px solid #d4e6c3; border-radius:8px; padding:1.25rem; font-family:inherit; background:#f9fdf6; max-width:420px; box-sizing:border-box; }
      .ebird-widget h3 { font-size:1rem; font-weight:700; margin:0 0 .25rem; }
      .ebird-widget .ew-date { font-size:.75rem; color:#666; margin:0 0 .75rem; }
      .ebird-widget h4 { font-size:.75rem; font-weight:600; text-transform:uppercase; letter-spacing:.05em; color:#444; margin:.75rem 0 .4rem; }
      .ebird-widget ul { list-style:none; margin:0; padding:0; }
      .ebird-widget li { display:flex; justify-content:space-between; padding:.3rem 0; border-bottom:1px solid #e8f0e2; font-size:.875rem; }
      .ebird-widget li.notable { color:#b91c1c; font-weight:500; }
      .ebird-widget .ew-count { color:#888; font-size:.8rem; }
      .ebird-widget .ew-obs-date { color:#aaa; font-size:.75rem; }
      .ebird-widget a.ew-link { display:inline-block; margin-top:.75rem; font-size:.8rem; color:#2d6a2d; text-decoration:none; font-weight:600; }
      .ebird-widget a.ew-link:hover { text-decoration:underline; }
      .ebird-widget .ew-empty { font-size:.875rem; color:#888; }
    `;
    document.head.appendChild(style);
  }

  // Fetch from our proxy
  const origin = script.src.split('/widget.js')[0];
  fetch(`${origin}/api/ebird?hotspot=${hotspot}`)
    .then(r => r.json())
    .then(data => {
      const { recent = [], notable = [], lastChecklist } = data;

      let html = '<div class="ebird-widget">';
      html += '<h3>Recent Bird Sightings</h3>';
      if (lastChecklist) html += `<p class="ew-date">Last checklist: ${formatDate(lastChecklist)}</p>`;

      if (notable.length) {
        html += '<h4>🔴 Rare Bird Alerts</h4><ul>';
        notable.slice(0, 5).forEach(b => {
          html += `<li class="notable"><span>${esc(b.comName)}</span><span class="ew-obs-date">${(b.obsDt||'').split(' ')[0]}</span></li>`;
        });
        html += '</ul>';
      }

      html += '<h4>Seen in the last 7 days</h4>';
      if (recent.length) {
        html += '<ul>';
        recent.slice(0, 10).forEach(b => {
          html += `<li><span>${esc(b.comName)}</span>${b.howMany ? `<span class="ew-count">${b.howMany}</span>` : ''}</li>`;
        });
        html += '</ul>';
      } else {
        html += '<p class="ew-empty">No sightings reported in the last 7 days.</p>';
      }

      html += `<a class="ew-link" href="https://ebird.org/hotspot/${hotspot}" target="_blank" rel="noopener">View full checklist on eBird →</a>`;
      html += '</div>';
      container.innerHTML = html;
    })
    .catch(() => {
      container.innerHTML = '<p style="font-size:13px;color:#888;">Sightings unavailable right now.</p>';
    });

  function formatDate(d) {
    const [y, m, day] = d.split('-');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[+m-1]} ${+day}, ${y}`;
  }

  function esc(str) {
    return (str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
})();