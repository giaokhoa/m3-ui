import { cssValue, defineCssAdapter, tokenReader } from '../adapter-helpers.mjs';

export function createScrimCss(context) {
  const get = tokenReader(context, 'Scrim CSS');
  return [
    '.scrim {',
    `  --_scrim-container-color: ${cssValue(get('scrim.containerColor'))};`,
    `  --_scrim-container-opacity: ${cssValue(get('scrim.containerOpacity'))};`,
    '  --_scrim-alpha: 1;',
    '}',
    '',
  ].join('\n');
}

export default defineCssAdapter('scrim', createScrimCss);
