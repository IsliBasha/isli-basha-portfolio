const { Redis } = require('@upstash/redis');

const HITS_KEY = 'portfolio:hits';

function getRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { sessionId } = req.body ?? {};
  if (!sessionId || typeof sessionId !== 'string' || sessionId.length > 64) {
    return res.status(400).json({ error: 'Invalid sessionId' });
  }

  const redis = getRedis();

  // Dev fallback: return a placeholder when Redis is not configured
  if (!redis) {
    return res.status(200).json({ count: 42 });
  }

  try {
    const sessionKey = `portfolio:session:${sessionId}`;
    // SETNX with 24h TTL — counts once per browser session
    const isNew = await redis.set(sessionKey, 1, { nx: true, ex: 86400 });
    if (isNew) {
      await redis.incr(HITS_KEY);
    }
    const count = (await redis.get(HITS_KEY)) ?? 0;
    return res.status(200).json({ count: Number(count) });
  } catch (err) {
    console.error('[visit] Redis error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
};
