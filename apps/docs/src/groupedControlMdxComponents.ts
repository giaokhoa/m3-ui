import type { MDXComponents } from 'mdx/types';
import {
  ButtonGroupPreview,
  SegmentedButtonPreview,
  SplitButtonPreview,
  TabsPreview,
} from './groupedControlDemos';

export const groupedControlMdxComponents = {
  TabsPreview,
  SegmentedButtonPreview,
  SplitButtonPreview,
  ButtonGroupPreview,
} satisfies MDXComponents;
