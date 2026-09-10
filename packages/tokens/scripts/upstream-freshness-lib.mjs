const GIT_SHA = /^[0-9a-f]{40}$/;

export const FRESHNESS_STATUSES = Object.freeze({
  current: 'current',
  newerUpstream: 'newer-upstream',
  unavailable: 'unavailable',
});

function errorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

function validateSource(sourceId, source) {
  if (typeof source?.repository !== 'string' || !source.repository.includes('/')) {
    throw new Error(`${sourceId}: freshness source must declare repository as owner/name`);
  }
  if (!GIT_SHA.test(source.revision ?? '')) {
    throw new Error(`${sourceId}: freshness source must declare a 40-character reviewed revision`);
  }
  if (!Number.isFinite(Date.parse(source.revisionAt ?? ''))) {
    throw new Error(`${sourceId}: freshness source must declare a valid revisionAt timestamp`);
  }
  if (typeof source.freshness?.ref !== 'string' || source.freshness.ref.length === 0) {
    throw new Error(`${sourceId}: freshness source must declare freshness.ref`);
  }
  if (!Array.isArray(source.freshness?.scopes) || source.freshness.scopes.length === 0) {
    throw new Error(`${sourceId}: freshness source must declare at least one freshness scope`);
  }
}

function validateScope(sourceId, scope) {
  if (typeof scope?.id !== 'string' || scope.id.length === 0) {
    throw new Error(`${sourceId}: freshness scope must declare a non-empty id`);
  }
  if (typeof scope.path !== 'string' || scope.path.length === 0 || scope.path.startsWith('/')) {
    throw new Error(`${sourceId}:${scope.id}: freshness scope must declare a repository-relative path`);
  }
}

export function collectFreshnessScopes(sources) {
  const scopes = [];
  for (const [sourceId, source] of Object.entries(sources)) {
    if (source?.freshness == null) continue;
    validateSource(sourceId, source);
    for (const scope of source.freshness.scopes) {
      validateScope(sourceId, scope);
      scopes.push({
        id: `${sourceId}:${scope.id}`,
        sourceId,
        sourceName: source.name,
        repository: source.repository,
        ref: source.freshness.ref,
        path: scope.path,
        reviewedRevision: source.revision,
        reviewedAt: source.revisionAt,
      });
    }
  }
  return scopes.sort((left, right) => left.id.localeCompare(right.id));
}

export function latestRelevantCommitUrl(scope) {
  const params = new URLSearchParams({
    sha: scope.ref,
    path: scope.path,
    per_page: '1',
  });
  return `https://api.github.com/repos/${scope.repository}/commits?${params}`;
}

function parseLatestCommit(scope, payload) {
  if (!Array.isArray(payload) || payload.length === 0) {
    throw new Error(`${scope.id}: upstream returned no commits for ${scope.path}`);
  }
  const item = payload[0];
  const revision = item?.sha;
  const at = item?.commit?.committer?.date ?? item?.commit?.author?.date;
  if (!GIT_SHA.test(revision ?? '') || !Number.isFinite(Date.parse(at ?? ''))) {
    throw new Error(`${scope.id}: upstream returned malformed commit metadata`);
  }
  return {
    revision,
    at,
    url: typeof item.html_url === 'string' ? item.html_url : null,
  };
}

function classify(scope, latest) {
  const reviewedTime = Date.parse(scope.reviewedAt);
  const latestTime = Date.parse(latest.at);
  // A path's newest commit can legitimately have a different SHA while still
  // predating the repository-wide reviewed pin. Time ordering prevents that
  // from becoming a false positive.
  return latestTime > reviewedTime
    ? FRESHNESS_STATUSES.newerUpstream
    : FRESHNESS_STATUSES.current;
}

function unavailableResult(scope, kind, message) {
  return {
    ...scope,
    latest: null,
    status: FRESHNESS_STATUSES.unavailable,
    error: { kind, message },
  };
}

export async function probeMaterialFreshness({
  sources,
  fetchImpl = globalThis.fetch,
  observedAt = new Date().toISOString(),
  headers = {},
}) {
  let scopes;
  try {
    scopes = collectFreshnessScopes(sources);
  } catch (error) {
    return {
      schemaVersion: 1,
      observedAt,
      summary: { current: 0, newerUpstream: 0, unavailable: 1 },
      scopes: [],
      configurationError: errorMessage(error),
    };
  }

  const results = [];
  for (const scope of scopes) {
    let response;
    try {
      response = await fetchImpl(latestRelevantCommitUrl(scope), { headers });
    } catch (error) {
      results.push(unavailableResult(scope, 'network', errorMessage(error)));
      continue;
    }

    if (!response?.ok) {
      results.push(
        unavailableResult(
          scope,
          'http',
          `GitHub request failed with status ${response?.status ?? 'unknown'}`,
        ),
      );
      continue;
    }

    try {
      const latest = parseLatestCommit(scope, await response.json());
      results.push({
        ...scope,
        latest,
        status: classify(scope, latest),
        error: null,
      });
    } catch (error) {
      results.push(unavailableResult(scope, 'invalid-response', errorMessage(error)));
    }
  }

  return {
    schemaVersion: 1,
    observedAt,
    summary: {
      current: results.filter((result) => result.status === FRESHNESS_STATUSES.current).length,
      newerUpstream: results.filter(
        (result) => result.status === FRESHNESS_STATUSES.newerUpstream,
      ).length,
      unavailable: results.filter((result) => result.status === FRESHNESS_STATUSES.unavailable)
        .length,
    },
    scopes: results,
    configurationError: null,
  };
}

export function freshnessExitCode(report) {
  if (report.configurationError != null || report.summary.unavailable > 0) return 2;
  if (report.summary.newerUpstream > 0) return 1;
  return 0;
}
