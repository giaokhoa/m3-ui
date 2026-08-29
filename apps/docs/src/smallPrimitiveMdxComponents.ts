import type { MDXComponents } from 'mdx/types';
import {
  NonInteractiveScrollbarPreview,
  ScrimPreview,
  SurfacePreview,
  VerticalDragHandlePreview,
} from './smallPrimitiveDemos';

export const smallPrimitiveMdxComponents = {
  SurfacePreview,
  ScrimPreview,
  VerticalDragHandlePreview,
  NonInteractiveScrollbarPreview,
} satisfies MDXComponents;
