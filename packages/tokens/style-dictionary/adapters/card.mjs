import {
  composite,
  cssValue,
  defineCssAdapter,
  tokenReader,
} from '../adapter-helpers.mjs';

export function createCardCss(context) {
  const get = tokenReader(context, 'Card CSS');
  const line = (name, value) => `  ${name}: ${cssValue(value)};`;
  const base = 'component.card.base';

  const variantRule = (variant) => {
    const prefix = `component.card.variant.${variant}`;
    const declarations = [
      line('--_card-container-color', get(`${prefix}.containerColor`)),
      line('--_card-content-color', get(`${prefix}.contentColor`)),
      line(
        '--_card-disabled-container-color',
        composite(
          get(`${prefix}.disabledContainerColor`),
          get(`${prefix}.disabledContainerOpacity`),
          get(`${prefix}.disabledCompositeOver`),
        ),
      ),
    ];

    if (variant === 'outlined') {
      declarations.push(
        line('--_card-outline-width', get(`${prefix}.outline.width`)),
        line('--_card-outline-color', get(`${prefix}.outline.color`)),
        line(
          '--_card-disabled-outline-color',
          composite(
            get(`${prefix}.outline.disabledColor`),
            get(`${prefix}.outline.disabledOpacity`),
            get(`${prefix}.outline.disabledCompositeOver`),
          ),
        ),
      );
    }

    return ['', `.card--${variant} {`, ...declarations, '}'];
  };

  return [
    '.card {',
    line('--_card-container-radius', get(`${base}.shapeRadius`)),
    line('--_card-min-interactive-size', get(`${base}.minimumInteractiveSize`)),
    line(
      '--_card-disabled-content-color',
      composite(
        get(`${base}.disabledContentColor`),
        get(`${base}.disabledContentOpacity`),
        'transparent',
      ),
    ),
    '}',
    ...variantRule('filled'),
    ...variantRule('elevated'),
    ...variantRule('outlined'),
    '',
  ].join('\n');
}

export default defineCssAdapter('card', createCardCss);
