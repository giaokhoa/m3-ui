import type { MDXComponents } from 'mdx/types';
import type { ComponentType } from 'react';
import { ApiReference } from './apiReference';
import { componentPageMdxComponents } from './componentPageMdxComponents';
import { NativeSignInFormPreview } from './formDemos';
import { MaterialSpecTable } from './materialSpecTable';
import { MdxClientComponent } from './mdx-client';
import { Surface } from './mdxDirectComponents';
import { staticMdxComponents } from './mdxStaticComponents';
import { parityMdxComponents } from './parityMdxComponents';

type ClientMdxProps = Record<string, unknown>;

function clientComponent(name: string): ComponentType<ClientMdxProps> {
  function ClientMdxProxy(props: ClientMdxProps) {
    return <MdxClientComponent {...props} __mdxComponent={name} />;
  }

  ClientMdxProxy.displayName = `DocsMdx(${name})`;
  return ClientMdxProxy;
}

export const docsMdxComponents = {
  ...staticMdxComponents,
  ApiReference,
  MaterialSpecTable,
  ...componentPageMdxComponents,
  ...parityMdxComponents,
  LiveExample: clientComponent('LiveExample'),
  ColorRoleGrid: clientComponent('ColorRoleGrid'),
  DynamicColorPreview: clientComponent('DynamicColorPreview'),
  TypeScaleSamples: clientComponent('TypeScaleSamples'),
  CheckboxPreview: clientComponent('CheckboxPreview'),
  RadioButtonPreview: clientComponent('RadioButtonPreview'),
  SwitchPreview: clientComponent('SwitchPreview'),
  SliderPreview: clientComponent('SliderPreview'),
  CardPreview: clientComponent('CardPreview'),
  ChipPreview: clientComponent('ChipPreview'),
  IconButtonPreview: clientComponent('IconButtonPreview'),
  FabPreview: clientComponent('FabPreview'),
  Button: clientComponent('Button'),
  ElevatedButton: clientComponent('ElevatedButton'),
  FilledTonalButton: clientComponent('FilledTonalButton'),
  OutlinedButton: clientComponent('OutlinedButton'),
  TextButton: clientComponent('TextButton'),
  TextField: clientComponent('TextField'),
  OutlinedTextField: clientComponent('OutlinedTextField'),
  SecureTextField: clientComponent('SecureTextField'),
  OutlinedSecureTextField: clientComponent('OutlinedSecureTextField'),
  DialogTrigger: clientComponent('DialogTrigger'),
  DialogOverlay: clientComponent('DialogOverlay'),
  Dialog: clientComponent('Dialog'),
  DialogIcon: clientComponent('DialogIcon'),
  DialogTitle: clientComponent('DialogTitle'),
  DialogDescription: clientComponent('DialogDescription'),
  DialogActions: clientComponent('DialogActions'),
  DialogAction: clientComponent('DialogAction'),
  DialogCloseAction: clientComponent('DialogCloseAction'),
  SearchBarPreview: clientComponent('SearchBarPreview'),
  ProgressIndicatorPreview: clientComponent('ProgressIndicatorPreview'),
  LoadingIndicatorPreview: clientComponent('LoadingIndicatorPreview'),
  SnackbarPreview: clientComponent('SnackbarPreview'),
  TooltipPreview: clientComponent('TooltipPreview'),
  TabsPreview: clientComponent('TabsPreview'),
  SegmentedButtonPreview: clientComponent('SegmentedButtonPreview'),
  SplitButtonPreview: clientComponent('SplitButtonPreview'),
  ButtonGroupPreview: clientComponent('ButtonGroupPreview'),
  ListItemPreview: clientComponent('ListItemPreview'),
  MenuPreview: clientComponent('MenuPreview'),
  BadgePreview: clientComponent('BadgePreview'),
  DividerPreview: clientComponent('DividerPreview'),
  DatePickerPreview: clientComponent('DatePickerPreview'),
  TimePickerPreview: clientComponent('TimePickerPreview'),
  BottomSheetPreview: clientComponent('BottomSheetPreview'),
  CarouselPreview: clientComponent('CarouselPreview'),
  ModalBottomSheetPreview: clientComponent('ModalBottomSheetPreview'),
  PullToRefreshPreview: clientComponent('PullToRefreshPreview'),
  ScrollFieldPreview: clientComponent('ScrollFieldPreview'),
  SwipeToDismissPreview: clientComponent('SwipeToDismissPreview'),
  SurfacePreview: clientComponent('SurfacePreview'),
  ScrimPreview: clientComponent('ScrimPreview'),
  VerticalDragHandlePreview: clientComponent('VerticalDragHandlePreview'),
  NonInteractiveScrollbarPreview: clientComponent('NonInteractiveScrollbarPreview'),
  TopAppBarPreview: clientComponent('TopAppBarPreview'),
  BottomAppBarPreview: clientComponent('BottomAppBarPreview'),
  FloatingToolbarPreview: clientComponent('FloatingToolbarPreview'),
  ToggleButtonPreview: clientComponent('ToggleButtonPreview'),
  FabMenuPreview: clientComponent('FabMenuPreview'),
  AppBarOverflowPreview: clientComponent('AppBarOverflowPreview'),
  NativeSignInFormPreview,
  Surface,
} satisfies MDXComponents;
