export default async function handler(req, res) {
  const sourceUrl = 'https://iso-home-truck-meter-01.willy-washburn.chatgpt.site/';
  try {
    const upstream = await fetch(sourceUrl, { cache: 'no-store' });
    if (!upstream.ok) {
      res.status(upstream.status).send('Unable to load approved HOME 1 source');
      return;
    }

    let html = await upstream.text();
    const injection = `
      <base href="${sourceUrl}">
      <style id="candidate-home1-plus-home2-size">
        .plus { width: clamp(128px, 10.4vw, 176px) !important; }
        .plus::before, .plus::after { height: 5px !important; }
        @media (max-width: 700px) {
          .plus { width: 136px !important; }
        }
      </style>`;

    if (html.includes('</head>')) html = html.replace('</head>', `${injection}</head>`);
    else html = injection + html;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.status(200).send(html);
  } catch (error) {
    res.status(502).send(`Unable to load approved HOME 1 source: ${error.message}`);
  }
}
