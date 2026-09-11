import type { MDXComponents } from 'mdx/types';
import {
  BottomAppBarPreview,
  FloatingToolbarPreview,
  TopAppBarPreview,
} from './appBarToolbarDemos';

export const appBarToolbarMdxComponents = {
  TopAppBarPreview,
  BottomAppBarPreview,
  FloatingToolbarPreview,
} satisfies MDXComponents;
