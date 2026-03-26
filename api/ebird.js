export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

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

    const dates = recent.map(b => b.obsDt?.split(' ')[0]).filter(Boolean);
    const lastChecklist = dates.sort().reverse()[0] || null;

    res.status(200).json({ recent, notable, lastChecklist });
  } catch (err) {
    res.status(500).json({ error: 'eBird fetch failed' });
  }
}