import type { MDXComponents } from 'mdx/types';
import {
  BadgePreview,
  DividerPreview,
  ListItemPreview,
  MenuPreview,
} from './contentPrimitiveDemos';

export const contentPrimitiveMdxComponents = {
  ListItemPreview,
  MenuPreview,
  BadgePreview,
  DividerPreview,
} satisfies MDXComponents;
