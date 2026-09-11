'use client';

import type { MDXComponents } from 'mdx/types';
import type { ComponentType } from 'react';
import {
  Button,
  Dialog,
  DialogAction,
  DialogActions,
  DialogCloseAction,
  DialogDescription,
  DialogIcon,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
  ElevatedButton,
  FilledTonalButton,
  OutlinedButton,
  OutlinedSecureTextField,
  OutlinedTextField,
  SecureTextField,
  TextButton,
  TextField,
} from '@m3-ui/ui';
import {
  CardPreview,
  ChipPreview,
  FabPreview,
  IconButtonPreview,
} from './actionSurfaceDemos';
import {
  ColorRoleGrid,
  DynamicColorPreview,
  TypeScaleSamples,
} from './foundationDemos';
import { LiveExample } from './liveExample';
import {
  CheckboxPreview,
  RadioButtonPreview,
  SliderPreview,
  SwitchPreview,
} from './selectionControlDemos';
import { feedbackSearchMdxComponents } from './feedbackSearchMdxComponents';
import { groupedControlMdxComponents } from './groupedControlMdxComponents';
import { contentPrimitiveMdxComponents } from './contentPrimitiveMdxComponents';
import { pickerMdxComponents } from './pickerMdxComponents';
import { carouselSheetMdxComponents } from './carouselSheetMdxComponents';
import { composeUtilityMdxComponents } from './composeUtilityMdxComponents';
import { smallPrimitiveMdxComponents } from './smallPrimitiveMdxComponents';
import { appBarToolbarMdxComponents } from './appBarToolbarMdxComponents';
import { actionOverflowMdxComponents } from './actionOverflowMdxComponents';

const docsMdxComponents = {
  LiveExample,
  ColorRoleGrid,
  DynamicColorPreview,
  TypeScaleSamples,
  CheckboxPreview,
  RadioButtonPreview,
  SwitchPreview,
  SliderPreview,
  CardPreview,
  ChipPreview,
  IconButtonPreview,
  FabPreview,
  Button,
  ElevatedButton,
  FilledTonalButton,
  OutlinedButton,
  TextButton,
  TextField,
  OutlinedTextField,
  SecureTextField,
  OutlinedSecureTextField,
  DialogTrigger,
  DialogOverlay,
  Dialog,
  DialogIcon,
  DialogTitle,
  DialogDescription,
  DialogActions,
  DialogAction,
  DialogCloseAction,
  ...feedbackSearchMdxComponents,
  ...groupedControlMdxComponents,
  ...contentPrimitiveMdxComponents,
  ...pickerMdxComponents,
  ...carouselSheetMdxComponents,
  ...composeUtilityMdxComponents,
  ...smallPrimitiveMdxComponents,
  ...appBarToolbarMdxComponents,
  ...actionOverflowMdxComponents,
} satisfies MDXComponents;

export function MdxClientComponent({
  __mdxComponent,
  ...props
}: { __mdxComponent: string } & Record<string, unknown>) {
  const Component = docsMdxComponents[
    __mdxComponent as keyof typeof docsMdxComponents
  ] as ComponentType<Record<string, unknown>> | undefined;

  if (!Component) {
    throw new Error(`Unknown interactive docs MDX component: ${__mdxComponent}`);
  }

  return <Component {...props} />;
}
