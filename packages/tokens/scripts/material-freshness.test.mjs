import assert from 'node:assert/strict';
import test from 'node:test';
import {
  MATERIAL_FRESHNESS_EXIT_CODE,
  MATERIAL_FRESHNESS_STATUS,
  createMaterialFreshnessReport,
  materialFreshnessExitCode,
  resolveMaterialFreshnessScope,
  validateMaterialFreshnessScope,
} from './material-freshness-lib.mjs';

const PIN = 'a'.repeat(40);
const OLD = 'b'.repeat(40);
const NEW = 'c'.repeat(40);
const NEWER = 'd'.repeat(40);
const PIN_AT = '2026-08-22T05:52:17.000Z';

function sourceFixture() {
  return {
    compose: {
      kind: 'implementation-reference',
      name: 'Compose fixture',
      repository: 'example/material',
      revision: PIN,
      revisionAt: PIN_AT,
    },
  };
}

function scopeFixture(overrides = {}) {
  return {
    id: 'material-core',
    source: 'compose',
    upstreamRef: 'main',
    paths: ['material/core'],
    ...overrides,
  };
}

function jsonResponse(payload, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async json() {
      return payload;
    },
  };
}

function commit(sha, date, url = `https://github.com/example/material/commit/${sha}`) {
  return {
    sha,
    html_url: url,
    commit: { committer: { date } },
  };
}

function fetchFixture({ commitsByPath, compareByHead = {}, requests = [] }) {
  return async (input) => {
    const url = new URL(input);
    requests.push(url);
    if (url.pathname.endsWith('/commits')) {
      const path = url.searchParams.get('path');
      assert.ok(path, 'freshness probe must never query repository-wide commit activity');
      return jsonResponse(commitsByPath[path] ?? []);
    }
    const marker = '/compare/';
    if (url.pathname.includes(marker)) {
      const comparison = decodeURIComponent(url.pathname.split(marker)[1]);
      const [, head] = comparison.split('...');
      return jsonResponse(
        compareByHead[head] ?? { status: 'behind', ahead_by: 0, behind_by: 1 },
      );
    }
    throw new Error(`unexpected request: ${url}`);
  };
}

test('classifies a latest relevant path commit behind the reviewed pin as current', async () => {
  const fetchImpl = fetchFixture({
    commitsByPath: {
      'material/core': [commit(OLD, '2026-08-20T12:00:00Z')],
    },
  });
  const result = await resolveMaterialFreshnessScope(scopeFixture(), {
    sources: sourceFixture(),
    fetchImpl,
  });

  assert.equal(result.status, MATERIAL_FRESHNESS_STATUS.current);
  assert.equal(result.latest.revision, OLD);
  assert.equal(result.comparison.status, 'behind');
});

test('classifies a relevant descendant commit as newer upstream evidence', async () => {
  const fetchImpl = fetchFixture({
    commitsByPath: {
      'material/core': [commit(NEW, '2026-09-02T12:00:00Z')],
    },
    compareByHead: {
      [NEW]: { status: 'ahead', ahead_by: 14, behind_by: 0 },
    },
  });
  const result = await resolveMaterialFreshnessScope(scopeFixture(), {
    sources: sourceFixture(),
    fetchImpl,
  });

  assert.equal(result.status, MATERIAL_FRESHNESS_STATUS.newerUpstream);
  assert.equal(result.latest.revision, NEW);
  assert.equal(result.comparison.aheadBy, 14);
});

test('does not misclassify a diverged history as semantic upstream drift', async () => {
  const fetchImpl = fetchFixture({
    commitsByPath: {
      'material/core': [commit(NEW, '2026-09-02T12:00:00Z')],
    },
    compareByHead: {
      [NEW]: { status: 'diverged', ahead_by: 4, behind_by: 2 },
    },
  });
  const result = await resolveMaterialFreshnessScope(scopeFixture(), {
    sources: sourceFixture(),
    fetchImpl,
  });

  assert.equal(result.status, MATERIAL_FRESHNESS_STATUS.unavailable);
  assert.equal(result.comparison.status, 'diverged');
  assert.match(result.errors[0], /diverged/);
});

test('monitors only configured paths and ignores unrelated repository activity', async () => {
  const requests = [];
  const fetchImpl = fetchFixture({
    commitsByPath: {
      'material/core': [commit(OLD, '2026-08-20T12:00:00Z')],
    },
    requests,
  });
  const result = await resolveMaterialFreshnessScope(scopeFixture(), {
    sources: sourceFixture(),
    fetchImpl,
  });

  assert.equal(result.status, MATERIAL_FRESHNESS_STATUS.current);
  const commitRequests = requests.filter((url) => url.pathname.endsWith('/commits'));
  assert.equal(commitRequests.length, 1);
  assert.equal(commitRequests[0].searchParams.get('path'), 'material/core');
  assert.equal(commitRequests[0].searchParams.get('sha'), 'main');
  assert.equal(commitRequests[0].searchParams.get('per_page'), '1');
});

test('selects the newest commit across multiple monitored paths deterministically', async () => {
  const fetchImpl = fetchFixture({
    commitsByPath: {
      'material/core': [commit(NEW, '2026-09-02T12:00:00Z')],
      'material/ripple': [commit(NEWER, '2026-09-03T12:00:00Z')],
    },
    compareByHead: {
      [NEWER]: { status: 'ahead', ahead_by: 20, behind_by: 0 },
    },
  });
  const result = await resolveMaterialFreshnessScope(
    scopeFixture({ paths: ['material/core', 'material/ripple'] }),
    { sources: sourceFixture(), fetchImpl },
  );

  assert.equal(result.status, MATERIAL_FRESHNESS_STATUS.newerUpstream);
  assert.equal(result.latest.revision, NEWER);
  assert.equal(result.latest.path, 'material/ripple');
});

test('classifies network and API failure as unavailable rather than drift', async () => {
  const networkFailure = await resolveMaterialFreshnessScope(scopeFixture(), {
    sources: sourceFixture(),
    fetchImpl: async () => {
      throw new Error('socket unavailable');
    },
  });
  assert.equal(networkFailure.status, MATERIAL_FRESHNESS_STATUS.unavailable);
  assert.match(networkFailure.errors[0], /socket unavailable/);

  const rateLimited = await resolveMaterialFreshnessScope(scopeFixture(), {
    sources: sourceFixture(),
    fetchImpl: async () => jsonResponse({ message: 'API rate limit exceeded' }, 403),
  });
  assert.equal(rateLimited.status, MATERIAL_FRESHNESS_STATUS.unavailable);
  assert.match(rateLimited.errors[0], /HTTP 403/);
  assert.match(rateLimited.errors[0], /rate limit/i);
});

test('rejects malformed freshness configuration without making network requests', async () => {
  let fetchCalls = 0;
  const malformed = scopeFixture({ paths: [], upstreamRef: '' });
  const validation = validateMaterialFreshnessScope(malformed, sourceFixture());
  assert.ok(validation.some((message) => message.includes('upstreamRef')));
  assert.ok(validation.some((message) => message.includes('paths')));

  const result = await resolveMaterialFreshnessScope(malformed, {
    sources: sourceFixture(),
    fetchImpl: async () => {
      fetchCalls += 1;
      throw new Error('must not run');
    },
  });
  assert.equal(result.status, MATERIAL_FRESHNESS_STATUS.invalidConfig);
  assert.equal(fetchCalls, 0);
});

test('treats monitored paths with no commit history as invalid configuration', async () => {
  const result = await resolveMaterialFreshnessScope(scopeFixture(), {
    sources: sourceFixture(),
    fetchImpl: fetchFixture({ commitsByPath: { 'material/core': [] } }),
  });
  assert.equal(result.status, MATERIAL_FRESHNESS_STATUS.invalidConfig);
  assert.match(result.errors[0], /no upstream commits/);
});

test('report creation does not mutate checked input sources or scopes', async () => {
  const sources = sourceFixture();
  const scopes = [scopeFixture()];
  const beforeSources = structuredClone(sources);
  const beforeScopes = structuredClone(scopes);
  await createMaterialFreshnessReport({
    sources,
    scopes,
    fetchImpl: fetchFixture({
      commitsByPath: {
        'material/core': [commit(OLD, '2026-08-20T12:00:00Z')],
      },
    }),
    now: () => new Date('2026-09-10T04:00:00Z'),
  });

  assert.deepEqual(sources, beforeSources);
  assert.deepEqual(scopes, beforeScopes);
});

test('report ordering and observation time are stable with injected inputs', async () => {
  const scopes = [
    scopeFixture({ id: 'z-last', paths: ['material/z'] }),
    scopeFixture({ id: 'a-first', paths: ['material/a'] }),
  ];
  const fetchImpl = fetchFixture({
    commitsByPath: {
      'material/a': [commit(OLD, '2026-08-20T12:00:00Z')],
      'material/z': [commit(OLD, '2026-08-20T12:00:00Z')],
    },
  });
  const report = await createMaterialFreshnessReport({
    sources: sourceFixture(),
    scopes,
    fetchImpl,
    now: () => new Date('2026-09-10T04:00:00Z'),
  });

  assert.equal(report.schemaVersion, 1);
  assert.equal(report.observedAt, '2026-09-10T04:00:00.000Z');
  assert.deepEqual(report.sources.map((source) => source.id), ['a-first', 'z-last']);
  assert.deepEqual(report.sources.map((source) => source.status), ['current', 'current']);
});

test('exit codes distinguish drift, unavailable probes, and invalid configuration', () => {
  const report = (statuses) => ({ sources: statuses.map((status) => ({ status })) });
  assert.equal(
    materialFreshnessExitCode(report([MATERIAL_FRESHNESS_STATUS.current])),
    MATERIAL_FRESHNESS_EXIT_CODE.current,
  );
  assert.equal(
    materialFreshnessExitCode(report([MATERIAL_FRESHNESS_STATUS.newerUpstream])),
    MATERIAL_FRESHNESS_EXIT_CODE.newerUpstream,
  );
  assert.equal(
    materialFreshnessExitCode(
      report([
        MATERIAL_FRESHNESS_STATUS.newerUpstream,
        MATERIAL_FRESHNESS_STATUS.unavailable,
      ]),
    ),
    MATERIAL_FRESHNESS_EXIT_CODE.unavailable,
  );
  assert.equal(
    materialFreshnessExitCode(
      report([
        MATERIAL_FRESHNESS_STATUS.unavailable,
        MATERIAL_FRESHNESS_STATUS.invalidConfig,
      ]),
    ),
    MATERIAL_FRESHNESS_EXIT_CODE.invalidConfig,
  );
});
