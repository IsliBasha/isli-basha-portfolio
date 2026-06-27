import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@upstash/redis', () => ({
  Redis: vi.fn().mockImplementation(() => ({
    set: vi.fn().mockResolvedValue('OK'),
    get: vi.fn().mockResolvedValue(42),
    incr: vi.fn().mockResolvedValue(1),
  })),
}));

import handler from './visit.js';

function makeReq(overrides = {}) {
  return {
    method: 'POST',
    body: { sessionId: 'test-session-abc123' },
    headers: {},
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

describe('POST /api/visit', () => {
  beforeEach(() => {
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;
  });

  describe('CORS', () => {
    it('restricts origin to https://islibasha.dev', async () => {
      const res = makeRes();
      await handler(makeReq(), res);
      expect(res._headers['Access-Control-Allow-Origin']).toBe('https://islibasha.dev');
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

  describe('sessionId validation', () => {
    it('returns 400 when sessionId is missing', async () => {
      const res = makeRes();
      await handler(makeReq({ body: {} }), res);
      expect(res._status).toBe(400);
    });

    it('returns 400 when sessionId is too long', async () => {
      const res = makeRes();
      await handler(makeReq({ body: { sessionId: 'x'.repeat(65) } }), res);
      expect(res._status).toBe(400);
    });
  });

  describe('fallback when redis not configured', () => {
    it('returns 200 with a count when redis env vars are absent', async () => {
      const res = makeRes();
      await handler(makeReq(), res);
      expect(res._status).toBe(200);
      expect(res._body).toHaveProperty('count');
    });
  });
});
