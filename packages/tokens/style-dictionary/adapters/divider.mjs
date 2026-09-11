import {
  cssValue,
  defineCssAdapter,
  tokenReader,
} from '../adapter-helpers.mjs';

export function createDividerCss(context) {
  const get = tokenReader(context, 'Divider CSS');
  const line = (name, value) => `  ${name}: ${cssValue(value)};`;

  return [
    '.divider {',
    line('--_divider-color', get('component.divider.color')),
    line('--_divider-thickness', get('component.divider.thickness')),
    '}',
    '',
  ].join('\n');
}

export default defineCssAdapter('divider', createDividerCss);
