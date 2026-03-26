const ALLOWED_ORIGINS = [
  'https://www.nycbirdalliance.org',
  'https://nycbirdalliance.org',
];

export default async function handler(req, res) {
  const origin = req.headers.origin || req.headers.referer || '';
  const allowed = ALLOWED_ORIGINS.some(o => origin.startsWith(o));

  if (!allowed) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  res.setHeader('Access-Control-Allow-Origin', origin);

  const { hotspot } = req.query;
  if (!hotspot) return res.status(400).json({ error: 'Missing hotspot param' });

  const key = process.env.EBIRD_API_KEY;
  const headers = { 'x-ebirdapitoken': key };
  const base = 'https://api.ebird.org/v2';

  try {
    const [recentRes, notableRes] = await Promise.all([
      fetch(`${base}/data/obs/${hotspot}/recent?back=7`, { headers }),
      fetch(`${base}/data/obs/${hotspot}/recent/notable?back=7`, { headers })
    ]);

    const recent  = await recentRes.json();
    const notable = await notableRes.json();

    // Most recent checklist date
    const dates = recent.map(b => b.obsDt?.split(' ')[0]).filter(Boolean);
    const lastChecklist = dates.sort().reverse()[0] || null;

    res.status(200).json({ recent, notable, lastChecklist });
  } catch (err) {
    res.status(500).json({ error: 'eBird fetch failed' });
  }
}