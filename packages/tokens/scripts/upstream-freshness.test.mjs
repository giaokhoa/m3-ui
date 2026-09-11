import assert from 'node:assert/strict';
import test from 'node:test';
import { material3Sources } from './sources.mjs';
import {
  collectFreshnessScopes,
  compareRevisionsUrl,
  FRESHNESS_OUTCOMES,
  FRESHNESS_STATUSES,
  freshnessExitCode,
  freshnessOutcome,
  latestRelevantCommitUrl,
  probeMaterialFreshness,
  renderFreshnessSummary,
} from './upstream-freshness-lib.mjs';

const reviewedRevision = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const olderPathRevision = 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';
const newerPathRevision = 'cccccccccccccccccccccccccccccccccccccccc';

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

function commit(sha, at = '2026-09-02T14:50:50Z') {
  return [
    {
      sha,
      html_url: `https://github.com/example/upstream/commit/${sha}`,
      commit: { committer: { date: at } },
    },
  ];
}

function sequencedFetch(...responses) {
  let index = 0;
  return async () => {
    const next = responses[index];
    index += 1;
    if (next instanceof Error) throw next;
    return next;
  };
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

test('GitHub queries are scoped to the monitored ref/path and reviewed ancestry', () => {
  const [scope] = collectFreshnessScopes({ example: source() });
  const latestUrl = new URL(latestRelevantCommitUrl(scope));
  assert.equal(latestUrl.pathname, '/repos/example/upstream/commits');
  assert.equal(latestUrl.searchParams.get('sha'), 'main');
  assert.equal(latestUrl.searchParams.get('path'), 'packages/core');
  assert.equal(latestUrl.searchParams.get('per_page'), '1');

  const compareUrl = new URL(compareRevisionsUrl(scope, newerPathRevision));
  assert.equal(
    compareUrl.pathname,
    `/repos/example/upstream/compare/${reviewedRevision}...${newerPathRevision}`,
  );
});

test('different path SHA remains current when that path commit is behind the reviewed pin', async () => {
  const report = await probeMaterialFreshness({
    sources: { example: source() },
    observedAt: '2026-09-10T00:00:00Z',
    fetchImpl: sequencedFetch(
      response(commit(olderPathRevision, '2026-09-09T12:00:00Z')),
      response({ status: 'behind' }),
    ),
  });

  assert.equal(report.scopes[0].relation, 'behind');
  assert.equal(report.scopes[0].status, FRESHNESS_STATUSES.current);
  assert.equal(report.summary.current, 1);
  assert.equal(freshnessExitCode(report), 0);
});

test('path commit ahead of the reviewed pin reports newer upstream independent of timestamp', async () => {
  const report = await probeMaterialFreshness({
    sources: { example: source() },
    observedAt: '2026-09-10T00:00:00Z',
    fetchImpl: sequencedFetch(
      response(commit(newerPathRevision, '2026-06-30T12:00:00Z')),
      response({ status: 'ahead' }),
    ),
  });

  assert.equal(report.scopes[0].relation, 'ahead');
  assert.equal(report.scopes[0].status, FRESHNESS_STATUSES.newerUpstream);
  assert.equal(report.summary.newerUpstream, 1);
  assert.equal(freshnessExitCode(report), 1);
});

test('exact reviewed revision is current without an ancestry request', async () => {
  let calls = 0;
  const report = await probeMaterialFreshness({
    sources: { example: source() },
    fetchImpl: async () => {
      calls += 1;
      return response(commit(reviewedRevision));
    },
  });

  assert.equal(calls, 1);
  assert.equal(report.scopes[0].relation, 'identical');
  assert.equal(report.scopes[0].status, FRESHNESS_STATUSES.current);
});

test('network and HTTP failures remain unavailable rather than semantic drift', async () => {
  const latestNetworkFailure = await probeMaterialFreshness({
    sources: { example: source() },
    fetchImpl: sequencedFetch(new Error('offline')),
  });
  assert.equal(latestNetworkFailure.scopes[0].status, FRESHNESS_STATUSES.unavailable);
  assert.equal(latestNetworkFailure.scopes[0].error.kind, 'network');

  const compareHttpFailure = await probeMaterialFreshness({
    sources: { example: source() },
    fetchImpl: sequencedFetch(
      response(commit(newerPathRevision)),
      response({}, { ok: false, status: 403 }),
    ),
  });
  assert.equal(compareHttpFailure.scopes[0].status, FRESHNESS_STATUSES.unavailable);
  assert.equal(compareHttpFailure.scopes[0].error.kind, 'http');
  assert.equal(compareHttpFailure.scopes[0].latest.revision, newerPathRevision);
  assert.equal(freshnessExitCode(compareHttpFailure), 2);
});

test('malformed latest payload and unsupported ancestry are classified separately', async () => {
  const malformed = await probeMaterialFreshness({
    sources: { example: source() },
    fetchImpl: async () => response([{ sha: 'short', commit: {} }]),
  });
  assert.equal(malformed.scopes[0].error.kind, 'invalid-response');

  const diverged = await probeMaterialFreshness({
    sources: { example: source() },
    fetchImpl: sequencedFetch(
      response(commit(newerPathRevision)),
      response({ status: 'diverged' }),
    ),
  });
  assert.equal(diverged.scopes[0].status, FRESHNESS_STATUSES.unavailable);
  assert.equal(diverged.scopes[0].error.kind, 'ancestry');
  assert.equal(freshnessExitCode(diverged), 2);
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
  assert.equal(freshnessOutcome(report), FRESHNESS_OUTCOMES.invalidConfiguration);
  assert.equal(freshnessExitCode(report), 3);
});

test('scope output is deterministically ordered and probe does not mutate source metadata', async () => {
  const sources = {
    zeta: source({ freshness: { ref: 'main', scopes: [{ id: 'z', path: 'z' }] } }),
    alpha: source({ freshness: { ref: 'main', scopes: [{ id: 'a', path: 'a' }] } }),
  };
  const before = structuredClone(sources);
  const report = await probeMaterialFreshness({
    sources,
    fetchImpl: sequencedFetch(
      response(commit(reviewedRevision)),
      response(commit(reviewedRevision)),
    ),
  });

  assert.deepEqual(report.scopes.map((item) => item.id), ['alpha:a', 'zeta:z']);
  assert.deepEqual(sources, before);
});

test('unavailable result takes exit-code precedence over detected drift', () => {
  const report = {
    configurationError: null,
    summary: { current: 0, newerUpstream: 1, unavailable: 1 },
  };
  assert.equal(freshnessOutcome(report), FRESHNESS_OUTCOMES.unavailable);
  assert.equal(freshnessExitCode(report), 2);
});

test('GitHub summary renders exact reviewed/latest provenance and actionable drift status', async () => {
  const report = await probeMaterialFreshness({
    sources: { example: source() },
    observedAt: '2026-09-10T00:00:00Z',
    fetchImpl: sequencedFetch(
      response(commit(newerPathRevision, '2026-09-10T01:02:03Z')),
      response({ status: 'ahead' }),
    ),
  });

  assert.equal(freshnessOutcome(report), FRESHNESS_OUTCOMES.newerUpstream);
  const summary = renderFreshnessSummary(report);
  assert.match(summary, /Outcome:\*\* `newer-upstream`/);
  assert.match(summary, new RegExp(reviewedRevision));
  assert.match(summary, new RegExp(newerPathRevision));
  assert.match(summary, /packages\/core/);
  assert.match(summary, /2026-09-10T01:02:03Z/);
  assert.match(summary, /newer-upstream \(ahead\)/);
  assert.match(summary, /Triage the affected scopes before changing reviewed pins/);
});

test('summary keeps unavailable and invalid configuration distinct from semantic drift', async () => {
  const unavailable = await probeMaterialFreshness({
    sources: { example: source() },
    observedAt: '2026-09-10T00:00:00Z',
    fetchImpl: sequencedFetch(new Error('offline')),
  });
  assert.equal(freshnessOutcome(unavailable), FRESHNESS_OUTCOMES.unavailable);
  assert.match(renderFreshnessSummary(unavailable), /This is not semantic drift/);
  assert.match(renderFreshnessSummary(unavailable), /network: latest commit: offline/);

  const invalid = await probeMaterialFreshness({
    sources: { broken: source({ freshness: { ref: '', scopes: [] } }) },
    observedAt: '2026-09-10T00:00:00Z',
  });
  assert.equal(freshnessOutcome(invalid), FRESHNESS_OUTCOMES.invalidConfiguration);
  assert.match(renderFreshnessSummary(invalid), /Outcome:\*\* `invalid-configuration`/);
  assert.match(renderFreshnessSummary(invalid), /Configuration error:/);
});
