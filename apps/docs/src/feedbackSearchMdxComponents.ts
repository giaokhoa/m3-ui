import type { MDXComponents } from 'mdx/types';
import {
  LoadingIndicatorPreview,
  ProgressIndicatorPreview,
  SearchBarPreview,
  SnackbarPreview,
  TooltipPreview,
} from './feedbackSearchDemos';

export const feedbackSearchMdxComponents = {
  SearchBarPreview,
  ProgressIndicatorPreview,
  LoadingIndicatorPreview,
  SnackbarPreview,
  TooltipPreview,
} satisfies MDXComponents;
