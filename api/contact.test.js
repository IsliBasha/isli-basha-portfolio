import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockIncr = vi.fn();
const mockExpire = vi.fn();

vi.mock('@upstash/redis', () => ({
  Redis: {
    fromEnv: vi.fn(() => ({ incr: mockIncr, expire: mockExpire })),
  },
}));

import handler from './contact.js';

function makeReq(overrides = {}) {
  return {
    method: 'POST',
    body: { message: 'Hello from the test' },
    headers: { 'x-forwarded-for': '1.2.3.4' },
    ...overrides,
  };
}

function makeRes() {
  const headers = {};
  let status = 200;
  let body = null;
  return {
    get _status() { return status; },
    get _body() { return body; },
    get _headers() { return headers; },
    setHeader(k, v) { headers[k] = v; },
    status(code) { status = code; return this; },
    json(data) { body = data; return this; },
    end() { return this; },
  };
}

describe('POST /api/contact', () => {
  beforeEach(() => {
    mockIncr.mockResolvedValue(1);
    mockExpire.mockResolvedValue(null);
    delete process.env.DISCORD_WEBHOOK_URL;
  });

  describe('CORS', () => {
    it('restricts origin to https://islibasha.dev', async () => {
      const res = makeRes();
      await handler(makeReq(), res);
      expect(res._headers['Access-Control-Allow-Origin']).toBe('https://islibasha.dev');
    });
  });

  describe('rate limiting', () => {
    it('returns 429 when IP exceeds 5 requests per hour', async () => {
      mockIncr.mockResolvedValue(6);
      const res = makeRes();
      await handler(makeReq(), res);
      expect(res._status).toBe(429);
      expect(res._body).toEqual({ error: 'Too many messages' });
    });

    it('allows the request when exactly at limit (count = 5)', async () => {
      mockIncr.mockResolvedValue(5);
      const res = makeRes();
      await handler(makeReq(), res);
      expect(res._status).toBe(200);
    });

    it('sets expiry on first request (count = 1)', async () => {
      mockIncr.mockResolvedValue(1);
      const res = makeRes();
      await handler(makeReq(), res);
      expect(mockExpire).toHaveBeenCalledWith(expect.stringContaining('1.2.3.4'), 3600);
    });
  });

  describe('method handling', () => {
    it('returns 200 for OPTIONS preflight', async () => {
      const res = makeRes();
      await handler(makeReq({ method: 'OPTIONS' }), res);
      expect(res._status).toBe(200);
    });

    it('returns 405 for GET requests', async () => {
      const res = makeRes();
      await handler(makeReq({ method: 'GET' }), res);
      expect(res._status).toBe(405);
    });
  });

  describe('message validation', () => {
    it('returns 400 when message is missing', async () => {
      const res = makeRes();
      await handler(makeReq({ body: {} }), res);
      expect(res._status).toBe(400);
    });

    it('returns 400 when message is whitespace only', async () => {
      const res = makeRes();
      await handler(makeReq({ body: { message: '   ' } }), res);
      expect(res._status).toBe(400);
    });

    it('returns 200 with ok:true when no webhook configured', async () => {
      const res = makeRes();
      await handler(makeReq(), res);
      expect(res._status).toBe(200);
      expect(res._body).toEqual({ ok: true });
    });
  });
});
