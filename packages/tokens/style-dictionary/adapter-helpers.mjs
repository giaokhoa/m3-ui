export function cssValue(value) {
  return String(value);
}

export function percent(value) {
  return `${Number(value) * 100}%`;
}

export function tokenReader({ dictionary, options }, consumer) {
  const tokenMap = dictionary.tokenMap;
  if (!(tokenMap instanceof Map)) {
    throw new TypeError(`${consumer}: Style Dictionary dictionary.tokenMap is required`);
  }

  return (path) => {
    const token = tokenMap.get(`{${path}}`) ?? tokenMap.get(path);
    if (!token) throw new Error(`Missing token for ${consumer}: ${path}`);
    const value = options.usesDtcg ? token.$value : token.value;
    if (value === undefined) {
      throw new Error(`Undefined token for ${consumer}: ${path}`);
    }
    return value;
  };
}

export function withOpacity(color, opacity) {
  const numericOpacity = Number(opacity);
  if (color === 'transparent' || numericOpacity <= 0) return 'transparent';
  if (numericOpacity >= 1) return color;
  return `color-mix(in srgb, ${color} ${percent(numericOpacity)}, transparent)`;
}

export function composite(color, opacity, over) {
  const numericOpacity = Number(opacity);
  if (numericOpacity <= 0) return over;
  if (numericOpacity >= 1) return color;
  return `color-mix(in srgb, ${color} ${percent(numericOpacity)}, ${over})`;
}

export function defineCssAdapter(name, createCss) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)) {
    throw new TypeError(`Invalid CSS adapter name: ${name}`);
  }
  if (typeof createCss !== 'function') {
    throw new TypeError(`CSS adapter ${name} must provide a formatter function`);
  }
  return Object.freeze({
    name,
    format: `m3/${name}-css`,
    destination: `${name}.css`,
    createCss,
  });
}
