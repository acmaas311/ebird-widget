export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { hotspot } = req.query;
  if (!hotspot) return res.status(400).json({ error: 'Missing hotspot param' });

  const key = process.env.EBIRD_API_KEY;
  const headers = { 'x-ebirdapitoken': key };
  const base = 'https://api.ebird.org/v2';

  // Days since the 1st of the current month (min 1, max 30)
  const now = new Date();
  const daysBack = Math.min(Math.max(now.getDate(), 1), 30);
  const monthName = now.toLocaleString('en-US', { month: 'long' });
  const year = now.getFullYear();

  try {
    const [recentRes, notableRes, infoRes, checklistsRes] = await Promise.all([
      fetch(`${base}/data/obs/${hotspot}/recent?back=${daysBack}`, { headers }),
      fetch(`${base}/data/obs/${hotspot}/recent/notable?back=${daysBack}`, { headers }),
      fetch(`${base}/ref/hotspot/info/${hotspot}`, { headers }),
      fetch(`${base}/product/lists/${hotspot}?maxResults=5`, { headers })
    ]);

    const recent     = await recentRes.json();
    const notable    = await notableRes.json();
    const info       = await infoRes.json();
    const checklists = await checklistsRes.json();

    // Unique species and eBirders this month
    const speciesThisMonth   = new Set(recent.map(b => b.speciesCode)).size;
    const checklistsThisMonth = Array.isArray(checklists) ? checklists.length : 0;
    const eBirdersThisMonth  = new Set(
      Array.isArray(checklists) ? checklists.map(c => c.userDisplayName).filter(Boolean) : []
    ).size;

    const dates = recent.map(b => b.obsDt?.split(' ')[0]).filter(Boolean);
    const lastChecklist = dates.sort().reverse()[0] || null;

    res.status(200).json({
      recent,
      notable,
      lastChecklist,
      checklists:         Array.isArray(checklists) ? checklists : [],
      hotspotName:        info.name             || null,
      numSpeciesAllTime:  info.numSpeciesAllTime || null,
      numChecklistsAllTime: info.numChecklists  || null,
      monthLabel:         `${monthName} ${year}`,
      speciesThisMonth,
      checklistsThisMonth,
      eBirdersThisMonth,
    });
  } catch (err) {
    res.status(500).json({ error: 'eBird fetch failed' });
  }
}