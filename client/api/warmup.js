// client/api/warmup.js
export default async function handler(req, res) {
  try {
    const url = `${process.env.BACKEND_URL}/health`;
    const r = await fetch(url, { cache: 'no-store' });
    if (!r.ok) throw new Error('health-not-ok');
    return res.status(200).send('ok');
  } catch (e) {
    return res.status(502).send('fail');
  }
}