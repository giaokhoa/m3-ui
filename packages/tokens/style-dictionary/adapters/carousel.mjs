import {
  cssValue,
  defineCssAdapter,
  tokenReader,
} from '../adapter-helpers.mjs';

export function createCarouselCss(context) {
  const get = tokenReader(context, 'Carousel CSS');
  const line = (name, value) => `  ${name}: ${cssValue(value)};`;

  return [
    '.carousel {',
    line('--_carousel-container-color', get('component.carouselItem.containerColor')),
    '}',
    '',
  ].join('\n');
}

export default defineCssAdapter('carousel', createCarouselCss);
