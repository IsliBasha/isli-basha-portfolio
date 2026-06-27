import { Redis } from '@upstash/redis';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://islibasha.dev');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ?? 'unknown';
  const redis = Redis.fromEnv();
  const rateLimitKey = `contact:ratelimit:${ip}`;
  const count = await redis.incr(rateLimitKey);
  if (count === 1) await redis.expire(rateLimitKey, 3600);
  if (count > 5) return res.status(429).json({ error: 'Too many messages' });

  const { message } = req.body ?? {};
  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Missing message' });
  }

  const text = message.trim().slice(0, 500);
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    console.log('[contact] dev message:', text);
    return res.status(200).json({ ok: true });
  }

  try {
    const payload = {
      embeds: [
        {
          title: '📨  Portfolio message',
          description: text,
          color: 0x000080,
          footer: { text: new Date().toUTCString() },
        },
      ],
    };

    const r = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!r.ok) {
      console.error('[contact] Discord webhook error:', r.status);
      return res.status(502).json({ error: 'Failed to deliver message' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[contact] error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
}
