const SHA_PATTERN = /^[0-9a-f]{40}$/;

export const MATERIAL_FRESHNESS_STATUS = Object.freeze({
  current: 'current',
  newerUpstream: 'newer-upstream',
  unavailable: 'unavailable',
  invalidConfig: 'invalid-config',
});

export const MATERIAL_FRESHNESS_EXIT_CODE = Object.freeze({
  current: 0,
  newerUpstream: 10,
  unavailable: 20,
  invalidConfig: 30,
});

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function normalizeDate(value) {
  if (!isNonEmptyString(value)) return null;
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return null;
  return new Date(timestamp).toISOString();
}

export function validateMaterialFreshnessScope(scope, sources) {
  const errors = [];
  if (scope == null || typeof scope !== 'object' || Array.isArray(scope)) {
    return ['scope must be an object'];
  }
  if (!isNonEmptyString(scope.id)) errors.push('id must be a non-empty string');
  if (!isNonEmptyString(scope.source)) errors.push('source must be a non-empty string');
  if (!isNonEmptyString(scope.upstreamRef)) {
    errors.push('upstreamRef must be a non-empty string');
  }
  if (!Array.isArray(scope.paths) || scope.paths.length === 0) {
    errors.push('paths must contain at least one monitored path');
  } else {
    const seen = new Set();
    for (const path of scope.paths) {
      if (!isNonEmptyString(path)) {
        errors.push('paths must contain only non-empty strings');
        continue;
      }
      if (path.startsWith('/') || path.includes('..')) {
        errors.push(`path must be repository-relative without parent traversal: ${path}`);
      }
      if (seen.has(path)) errors.push(`duplicate monitored path: ${path}`);
      seen.add(path);
    }
  }

  const source = sources?.[scope.source];
  if (source == null) {
    if (isNonEmptyString(scope.source)) errors.push(`unknown source key: ${scope.source}`);
    return errors;
  }
  if (!isNonEmptyString(source.repository)) {
    errors.push(`source ${scope.source} must provide repository`);
  }
  if (!isNonEmptyString(source.revision) || !SHA_PATTERN.test(source.revision)) {
    errors.push(`source ${scope.source} must provide a pinned 40-character revision`);
  }
  if (normalizeDate(source.revisionAt) == null) {
    errors.push(`source ${scope.source} must provide a valid revisionAt timestamp`);
  }
  return errors;
}

function githubHeaders(token) {
  return {
    accept: 'application/vnd.github+json',
    'user-agent': 'm3-ui-material-freshness',
    ...(token ? { authorization: `Bearer ${token}` } : {}),
  };
}

async function readGithubJson(url, { fetchImpl, token }) {
  let response;
  try {
    response = await fetchImpl(url, { headers: githubHeaders(token) });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`GitHub request failed: ${message}`, { cause: error });
  }

  if (!response?.ok) {
    let detail = '';
    try {
      const payload = await response.json();
      if (isNonEmptyString(payload?.message)) detail = `: ${payload.message}`;
    } catch {
      // Preserve the HTTP status even when the error body is not JSON.
    }
    throw new Error(`GitHub request failed with HTTP ${response?.status ?? 'unknown'}${detail}`);
  }

  try {
    return await response.json();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`GitHub response was not valid JSON: ${message}`, { cause: error });
  }
}

function latestCommitDate(commit) {
  return normalizeDate(commit?.commit?.committer?.date ?? commit?.commit?.author?.date);
}

function normalizeCommit(commit, path) {
  if (!SHA_PATTERN.test(commit?.sha ?? '')) return null;
  const revisionAt = latestCommitDate(commit);
  if (revisionAt == null) return null;
  return {
    revision: commit.sha,
    revisionAt,
    path,
    url: isNonEmptyString(commit.html_url) ? commit.html_url : null,
  };
}

function compareLatestCommits(left, right) {
  const dateDelta = Date.parse(right.revisionAt) - Date.parse(left.revisionAt);
  if (dateDelta !== 0) return dateDelta;
  const pathDelta = left.path.localeCompare(right.path);
  if (pathDelta !== 0) return pathDelta;
  return left.revision.localeCompare(right.revision);
}

async function resolveLatestCommitForPath({ repository, upstreamRef, path, fetchImpl, token }) {
  const url = new URL(`https://api.github.com/repos/${repository}/commits`);
  url.searchParams.set('sha', upstreamRef);
  url.searchParams.set('path', path);
  url.searchParams.set('per_page', '1');
  const payload = await readGithubJson(url, { fetchImpl, token });
  if (!Array.isArray(payload)) {
    throw new Error(`GitHub commits response for ${path} must be an array`);
  }
  if (payload.length === 0) return null;
  const commit = normalizeCommit(payload[0], path);
  if (commit == null) {
    throw new Error(`GitHub commits response for ${path} did not contain a valid commit`);
  }
  return commit;
}

async function compareReviewedPinToLatest({ repository, reviewedRevision, latestRevision, fetchImpl, token }) {
  if (reviewedRevision === latestRevision) {
    return { status: 'identical', aheadBy: 0, behindBy: 0 };
  }
  const url = `https://api.github.com/repos/${repository}/compare/${reviewedRevision}...${latestRevision}`;
  const payload = await readGithubJson(url, { fetchImpl, token });
  if (!isNonEmptyString(payload?.status)) {
    throw new Error('GitHub compare response did not contain status');
  }
  return {
    status: payload.status,
    aheadBy: Number.isInteger(payload.ahead_by) ? payload.ahead_by : null,
    behindBy: Number.isInteger(payload.behind_by) ? payload.behind_by : null,
  };
}

function classifyComparison(comparison) {
  if (comparison.status === 'identical' || comparison.status === 'behind') {
    return MATERIAL_FRESHNESS_STATUS.current;
  }
  if (comparison.status === 'ahead') {
    return MATERIAL_FRESHNESS_STATUS.newerUpstream;
  }
  // A diverged path means the reviewed pin cannot be safely ordered against the
  // observed upstream revision. Treat it as unavailable for automated freshness
  // rather than pretending divergence itself is semantic drift.
  return MATERIAL_FRESHNESS_STATUS.unavailable;
}

function reportBase(scope, source) {
  return {
    id: scope.id,
    source: scope.source,
    name: source?.name ?? null,
    repository: source?.repository ?? null,
    reviewed: {
      revision: source?.revision ?? null,
      revisionAt: normalizeDate(source?.revisionAt),
    },
    monitored: {
      ref: scope.upstreamRef ?? null,
      paths: Array.isArray(scope.paths) ? [...scope.paths].sort() : [],
    },
  };
}

export async function resolveMaterialFreshnessScope(
  scope,
  {
    sources,
    fetchImpl = globalThis.fetch,
    token,
  },
) {
  const source = sources?.[scope?.source];
  const base = reportBase(scope ?? {}, source);
  const configErrors = validateMaterialFreshnessScope(scope, sources);
  if (configErrors.length > 0) {
    return {
      ...base,
      status: MATERIAL_FRESHNESS_STATUS.invalidConfig,
      latest: null,
      comparison: null,
      errors: configErrors,
    };
  }
  if (typeof fetchImpl !== 'function') {
    return {
      ...base,
      status: MATERIAL_FRESHNESS_STATUS.unavailable,
      latest: null,
      comparison: null,
      errors: ['fetch implementation is unavailable'],
    };
  }

  try {
    const commits = (
      await Promise.all(
        scope.paths.map((path) =>
          resolveLatestCommitForPath({
            repository: source.repository,
            upstreamRef: scope.upstreamRef,
            path,
            fetchImpl,
            token,
          }),
        ),
      )
    ).filter(Boolean);

    if (commits.length === 0) {
      return {
        ...base,
        status: MATERIAL_FRESHNESS_STATUS.invalidConfig,
        latest: null,
        comparison: null,
        errors: ['monitored paths returned no upstream commits'],
      };
    }

    commits.sort(compareLatestCommits);
    const latest = commits[0];
    const comparison = await compareReviewedPinToLatest({
      repository: source.repository,
      reviewedRevision: source.revision,
      latestRevision: latest.revision,
      fetchImpl,
      token,
    });
    const status = classifyComparison(comparison);
    return {
      ...base,
      status,
      latest,
      comparison,
      ...(status === MATERIAL_FRESHNESS_STATUS.unavailable
        ? { errors: [`reviewed pin and upstream path history are ${comparison.status}`] }
        : {}),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      ...base,
      status: MATERIAL_FRESHNESS_STATUS.unavailable,
      latest: null,
      comparison: null,
      errors: [message],
    };
  }
}

export async function createMaterialFreshnessReport({
  sources,
  scopes,
  fetchImpl = globalThis.fetch,
  token,
  now = () => new Date(),
}) {
  const observedAtValue = now();
  const observedAt =
    observedAtValue instanceof Date
      ? observedAtValue.toISOString()
      : new Date(observedAtValue).toISOString();
  const orderedScopes = [...scopes].sort((left, right) => left.id.localeCompare(right.id));
  const results = [];
  for (const scope of orderedScopes) {
    results.push(
      await resolveMaterialFreshnessScope(scope, {
        sources,
        fetchImpl,
        token,
      }),
    );
  }
  return {
    schemaVersion: 1,
    observedAt,
    sources: results,
  };
}

export function materialFreshnessExitCode(report) {
  const statuses = new Set(report?.sources?.map((source) => source.status) ?? []);
  if (statuses.has(MATERIAL_FRESHNESS_STATUS.invalidConfig)) {
    return MATERIAL_FRESHNESS_EXIT_CODE.invalidConfig;
  }
  if (statuses.has(MATERIAL_FRESHNESS_STATUS.unavailable)) {
    return MATERIAL_FRESHNESS_EXIT_CODE.unavailable;
  }
  if (statuses.has(MATERIAL_FRESHNESS_STATUS.newerUpstream)) {
    return MATERIAL_FRESHNESS_EXIT_CODE.newerUpstream;
  }
  return MATERIAL_FRESHNESS_EXIT_CODE.current;
}
