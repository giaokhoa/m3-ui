import assert from 'node:assert/strict';
import test from 'node:test';
import { material3Sources } from './sources.mjs';
import {
  collectFreshnessScopes,
  FRESHNESS_STATUSES,
  freshnessExitCode,
  latestRelevantCommitUrl,
  probeMaterialFreshness,
} from './upstream-freshness-lib.mjs';

const reviewedRevision = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

function source(overrides = {}) {
  return {
    name: 'Example upstream',
    repository: 'example/upstream',
    revision: reviewedRevision,
    revisionAt: '2026-08-22T05:52:17Z',
    freshness: {
      ref: 'main',
      scopes: [{ id: 'core', path: 'packages/core' }],
    },
    ...overrides,
  };
}

function response(payload, { ok = true, status = 200 } = {}) {
  return {
    ok,
    status,
    async json() {
      return payload;
    },
  };
}

function commit(sha, at) {
  return [
    {
      sha,
      html_url: `https://github.com/example/upstream/commit/${sha}`,
      commit: { committer: { date: at } },
    },
  ];
}

test('checked-in monitor scopes are explicit, path-aware, and stable', () => {
  const scopes = collectFreshnessScopes(material3Sources);
  assert.deepEqual(
    scopes.map(({ id, repository, ref, path }) => ({ id, repository, ref, path })),
    [
      {
        id: 'compose:adaptive',
        repository: 'androidx/androidx',
        ref: 'androidx-main',
        path: 'compose/material3/adaptive',
      },
      {
        id: 'compose:adaptive-navigation-suite',
        repository: 'androidx/androidx',
        ref: 'androidx-main',
        path: 'compose/material3/material3-adaptive-navigation-suite',
      },
      {
        id: 'compose:core',
        repository: 'androidx/androidx',
        ref: 'androidx-main',
        path: 'compose/material3/material3',
      },
      {
        id: 'materialWeb:tokens',
        repository: 'material-components/material-web',
        ref: 'main',
        path: 'tokens',
      },
    ],
  );
});

test('latest commit query is scoped to ref and path instead of repository HEAD', () => {
  const [scope] = collectFreshnessScopes({ example: source() });
  const url = new URL(latestRelevantCommitUrl(scope));
  assert.equal(url.pathname, '/repos/example/upstream/commits');
  assert.equal(url.searchParams.get('sha'), 'main');
  assert.equal(url.searchParams.get('path'), 'packages/core');
  assert.equal(url.searchParams.get('per_page'), '1');
});

test('different path SHA does not create drift when its newest commit predates the reviewed pin', async () => {
  const report = await probeMaterialFreshness({
    sources: { example: source() },
    observedAt: '2026-09-10T00:00:00Z',
    fetchImpl: async () =>
      response(
        commit('bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', '2026-08-20T12:00:00Z'),
      ),
  });

  assert.equal(report.scopes[0].status, FRESHNESS_STATUSES.current);
  assert.equal(report.summary.current, 1);
  assert.equal(freshnessExitCode(report), 0);
});

test('relevant path commit after the reviewed pin reports newer upstream', async () => {
  const report = await probeMaterialFreshness({
    sources: { example: source() },
    observedAt: '2026-09-10T00:00:00Z',
    fetchImpl: async () =>
      response(
        commit('cccccccccccccccccccccccccccccccccccccccc', '2026-09-02T14:50:50Z'),
      ),
  });

  assert.equal(report.scopes[0].status, FRESHNESS_STATUSES.newerUpstream);
  assert.equal(report.summary.newerUpstream, 1);
  assert.equal(freshnessExitCode(report), 1);
});

test('network and HTTP failures remain unavailable rather than semantic drift', async () => {
  const sources = {
    alpha: source({ freshness: { ref: 'main', scopes: [{ id: 'core', path: 'alpha' }] } }),
    beta: source({ freshness: { ref: 'main', scopes: [{ id: 'core', path: 'beta' }] } }),
  };
  let calls = 0;
  const report = await probeMaterialFreshness({
    sources,
    fetchImpl: async () => {
      calls += 1;
      if (calls === 1) throw new Error('offline');
      return response([], { ok: false, status: 403 });
    },
  });

  assert.deepEqual(report.scopes.map((item) => item.status), ['unavailable', 'unavailable']);
  assert.deepEqual(report.scopes.map((item) => item.error.kind), ['network', 'http']);
  assert.equal(report.summary.unavailable, 2);
  assert.equal(freshnessExitCode(report), 2);
});

test('malformed upstream payload is classified separately', async () => {
  const report = await probeMaterialFreshness({
    sources: { example: source() },
    fetchImpl: async () => response([{ sha: 'short', commit: {} }]),
  });
  assert.equal(report.scopes[0].status, FRESHNESS_STATUSES.unavailable);
  assert.equal(report.scopes[0].error.kind, 'invalid-response');
  assert.equal(freshnessExitCode(report), 2);
});

test('invalid monitor configuration is reported without making a network request', async () => {
  let called = false;
  const report = await probeMaterialFreshness({
    sources: { broken: source({ freshness: { ref: '', scopes: [] } }) },
    fetchImpl: async () => {
      called = true;
      return response([]);
    },
  });

  assert.equal(called, false);
  assert.match(report.configurationError, /freshness\.ref/);
  assert.equal(report.summary.unavailable, 1);
  assert.equal(freshnessExitCode(report), 2);
});

test('scope output is deterministically ordered and probe does not mutate source metadata', async () => {
  const sources = {
    zeta: source({ freshness: { ref: 'main', scopes: [{ id: 'z', path: 'z' }] } }),
    alpha: source({ freshness: { ref: 'main', scopes: [{ id: 'a', path: 'a' }] } }),
  };
  const before = structuredClone(sources);
  const report = await probeMaterialFreshness({
    sources,
    fetchImpl: async () =>
      response(
        commit('dddddddddddddddddddddddddddddddddddddddd', '2026-08-20T12:00:00Z'),
      ),
  });

  assert.deepEqual(report.scopes.map((item) => item.id), ['alpha:a', 'zeta:z']);
  assert.deepEqual(sources, before);
});

test('unavailable result takes exit-code precedence over detected drift', () => {
  assert.equal(
    freshnessExitCode({
      configurationError: null,
      summary: { current: 0, newerUpstream: 1, unavailable: 1 },
    }),
    2,
  );
});
