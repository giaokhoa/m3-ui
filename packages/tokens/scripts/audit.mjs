export function compareTokenGraph(canonicalValues, referenceValues, mappings) {
  const results = [];
  for (const mapping of mappings) {
    const canonicalExists = canonicalValues.has(mapping.canonical);
    const referenceExists = referenceValues.has(mapping.reference);
    const canonical = canonicalValues.get(mapping.canonical);
    const reference = referenceValues.get(mapping.reference);

    let status = 'match';
    if (!canonicalExists) status = 'missing-canonical';
    else if (!referenceExists) status = 'missing-reference';
    else if (!Object.is(canonical, reference)) status = 'mismatch';

    results.push({ ...mapping, status, canonical, reference });
  }
  return results;
}

export function summarizeAudit(results) {
  return results.reduce(
    (summary, result) => {
      summary[result.status] += 1;
      return summary;
    },
    { match: 0, mismatch: 0, 'missing-canonical': 0, 'missing-reference': 0 },
  );
}

export function hasAuditDrift(results) {
  return results.some((result) => result.status !== 'match');
}
