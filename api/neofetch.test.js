import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import handler from './neofetch.js';

function makeReq(overrides = {}) {
  return {
    method: 'GET',
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

function jsonResponse(data, ok = true, status = 200) {
  return { ok, status, json: async () => data };
}

const USER_DATA = { login: 'IsliBasha', public_repos: 23, followers: 2 };
const REPOS_PAGE_1 = [
  { stargazers_count: 0, forks_count: 0, language: 'Rust' },
  { stargazers_count: 0, forks_count: 0, language: 'TypeScript' },
];
const ISSUES_DATA = { total_count: 11 };

function mockFetchHappyPath() {
  return vi.fn((url) => {
    const u = String(url);
    if (u.includes('/users/IsliBasha') && !u.includes('/repos')) {
      return Promise.resolve(jsonResponse(USER_DATA));
    }
    if (u.includes('/users/IsliBasha/repos')) {
      if (u.includes('page=1')) return Promise.resolve(jsonResponse(REPOS_PAGE_1));
      return Promise.resolve(jsonResponse([])); // page 2+ empty, terminates pagination
    }
    if (u.includes('/search/issues')) {
      return Promise.resolve(jsonResponse(ISSUES_DATA));
    }
    return Promise.resolve(jsonResponse({}, false, 404));
  });
}

describe('GET /api/neofetch', () => {
  const originalFetch = global.fetch;
  const originalToken = process.env.GITHUB_TOKEN;

  beforeEach(() => {
    delete process.env.GITHUB_TOKEN;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    if (originalToken === undefined) delete process.env.GITHUB_TOKEN;
    else process.env.GITHUB_TOKEN = originalToken;
  });

  describe('CORS', () => {
    it('restricts origin to https://islibasha.dev', async () => {
      global.fetch = mockFetchHappyPath();
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

    it('returns 405 for POST requests', async () => {
      const res = makeRes();
      await handler(makeReq({ method: 'POST' }), res);
      expect(res._status).toBe(405);
    });
  });

  describe('happy path', () => {
    it('returns 200 with computed stats', async () => {
      global.fetch = mockFetchHappyPath();
      const res = makeRes();
      await handler(makeReq(), res);

      expect(res._status).toBe(200);
      expect(res._body.repos).toBe(23);
      expect(res._body.followers).toBe(2);
      expect(res._body.stars).toBe(0);
      expect(res._body.forks).toBe(0);
      expect(res._body.issues).toBe(11);
    });

    it('estimates commits and lines of code from repo count', async () => {
      global.fetch = mockFetchHappyPath();
      const res = makeRes();
      await handler(makeReq(), res);

      // commits = repos * 50, formatted with thousands separator
      expect(res._body.commits).toBe('1,150');
      // loc = repos * 2000 + stars * 100
      expect(res._body.loc).toBe('46,000');
    });

    it('sets a cache-control header', async () => {
      global.fetch = mockFetchHappyPath();
      const res = makeRes();
      await handler(makeReq(), res);
      expect(res._headers['Cache-Control']).toContain('max-age');
    });
  });

  describe('auth', () => {
    it('sends an Authorization header when GITHUB_TOKEN is set', async () => {
      process.env.GITHUB_TOKEN = 'test-token-123';
      const fetchMock = mockFetchHappyPath();
      global.fetch = fetchMock;
      const res = makeRes();
      await handler(makeReq(), res);

      const [, opts] = fetchMock.mock.calls[0];
      expect(opts.headers.Authorization).toBe('Bearer test-token-123');
    });

    it('omits Authorization header when GITHUB_TOKEN is unset', async () => {
      const fetchMock = mockFetchHappyPath();
      global.fetch = fetchMock;
      const res = makeRes();
      await handler(makeReq(), res);

      const [, opts] = fetchMock.mock.calls[0];
      expect(opts.headers.Authorization).toBeUndefined();
    });
  });

  describe('error handling', () => {
    it('returns 502 when the GitHub API is unreachable', async () => {
      global.fetch = vi.fn(() => Promise.reject(new Error('network down')));
      const res = makeRes();
      await handler(makeReq(), res);
      expect(res._status).toBe(502);
      expect(res._body.error).toBeTruthy();
    });

    it('returns 502 when GitHub returns a non-ok user response', async () => {
      global.fetch = vi.fn(() => Promise.resolve(jsonResponse({}, false, 404)));
      const res = makeRes();
      await handler(makeReq(), res);
      expect(res._status).toBe(502);
    });
  });
});
