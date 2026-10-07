export default async function handler(req, res) {
  const allowed = new Set([
    'plastic.webp',
    'title-v4.png',
    'truck.png',
    'food.png',
    'price.png',
    'tribal-left.png',
    'tribal-right.png'
  ]);

  const name = typeof req.query.name === 'string' ? req.query.name : '';
  if (!allowed.has(name)) {
    res.status(400).send('Invalid asset');
    return;
  }

  const url = `https://iso-home-truck-meter-01.willy-washburn.chatgpt.site/assets/${name}`;

  try {
    const upstream = await fetch(url, { cache: 'no-store' });
    if (!upstream.ok) {
      res.status(upstream.status).send('Asset unavailable');
      return;
    }

    const bytes = Buffer.from(await upstream.arrayBuffer());
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/octet-stream');
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');
    res.status(200).send(bytes);
  } catch (error) {
    res.status(502).send(`Asset proxy error: ${error.message}`);
  }
}
