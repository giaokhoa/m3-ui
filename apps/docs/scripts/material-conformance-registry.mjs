export const CONFORMANCE_DIMENSIONS = [
  'api',
  'materialStatesVariants',
  'tokensVisuals',
  'behavior',
  'accessibility',
  'rtlLocalization',
  'motion',
  'theme',
  'browser',
  'ssr',
];

export function openRequiredDimensions(gapIssue = 296) {
  return Object.fromEntries(
    CONFORMANCE_DIMENSIONS.map((dimension) => [
      dimension,
      { status: 'required', gapIssue },
    ]),
  );
}

const requiredEvidence = (...evidence) => ({ status: 'required', evidence });
const notApplicable = (reason) => ({ status: 'not-applicable', reason });

const ACTION_INVENTORY_EVIDENCE = 'apps/docs/scripts/material-conformance.mjs';
const ACTION_THEME_EVIDENCE = 'apps/storybook/visual/actions-theme-conformance.visual.spec.ts';
const ACTION_SSR_EVIDENCE = 'packages/ui/src/action-families.ssr.test.tsx';

function actionDimensions({
  browserEvidence,
  tokenEvidence,
  apiEvidence = [],
  rtlEvidence = browserEvidence,
  rtlReason,
  themeEvidence = browserEvidence,
}) {
  return {
    api: requiredEvidence(
      ACTION_INVENTORY_EVIDENCE,
      ...apiEvidence,
      browserEvidence,
    ),
    materialStatesVariants: requiredEvidence(browserEvidence),
    tokensVisuals: requiredEvidence(...tokenEvidence, browserEvidence),
    behavior: requiredEvidence(browserEvidence),
    accessibility: requiredEvidence(browserEvidence),
    rtlLocalization: rtlReason
      ? notApplicable(rtlReason)
      : requiredEvidence(rtlEvidence),
    motion: requiredEvidence(browserEvidence),
    theme: requiredEvidence(themeEvidence),
    browser: requiredEvidence(browserEvidence),
    ssr: requiredEvidence(ACTION_SSR_EVIDENCE),
  };
}

const actionFamilyDimensions = {
  button: actionDimensions({
    browserEvidence: 'apps/storybook/visual/button.visual.spec.ts',
    apiEvidence: ['packages/ui/src/components/Button/Button.runtime.test.ts'],
    tokenEvidence: [
      'packages/tokens/scripts/audit-material-web-button-sizes.mjs',
      'packages/tokens/scripts/audit-material-web-button-variants.mjs',
      'packages/tokens/scripts/audit-material-web-button-generic.mjs',
    ],
  }),
  'button-group': actionDimensions({
    browserEvidence: 'apps/storybook/visual/button-group.visual.spec.ts',
    apiEvidence: [
      'packages/ui/src/components/ButtonGroup/ButtonGroup.defaults.test.ts',
    ],
    tokenEvidence: ['packages/tokens/scripts/audit-material-web-button-group.mjs'],
    themeEvidence: ACTION_THEME_EVIDENCE,
  }),
  fab: actionDimensions({
    browserEvidence: 'apps/storybook/visual/fab.visual.spec.ts',
    apiEvidence: [
      'packages/ui/src/components/Fab/Fab.defaults.test.ts',
      'packages/ui/src/components/Fab/Fab.elevation.test.ts',
    ],
    tokenEvidence: [
      'packages/tokens/scripts/audit-material-web-fab-sizes.mjs',
      'packages/tokens/scripts/audit-material-web-fab-roles.mjs',
      'packages/tokens/scripts/audit-material-web-fab-surface.mjs',
      'packages/tokens/scripts/audit-material-web-fab-remaining.mjs',
    ],
  }),
  'fab-menu': actionDimensions({
    browserEvidence: 'apps/storybook/visual/fab-menu.visual.spec.ts',
    apiEvidence: [
      'packages/ui/src/components/FabMenu/FabMenu.defaults.test.ts',
    ],
    tokenEvidence: ['packages/tokens/scripts/audit-material-web-fab-menu.mjs'],
    themeEvidence: ACTION_THEME_EVIDENCE,
  }),
  'icon-button': actionDimensions({
    browserEvidence: 'apps/storybook/visual/icon-button.visual.spec.ts',
    apiEvidence: [
      'packages/ui/src/components/IconButton/IconButton.runtime.test.ts',
    ],
    tokenEvidence: [
      'packages/tokens/scripts/audit-material-web-icon-button-sizes.mjs',
      'packages/tokens/scripts/audit-material-web-icon-button-variants.mjs',
      'packages/tokens/scripts/audit-material-web-icon-button-generic.mjs',
    ],
    rtlReason:
      'IconButton owns a symmetric icon-only container and does not own directional glyph mirroring or localized text. Consumers provide any direction-sensitive icon content.',
  }),
  'split-button': actionDimensions({
    browserEvidence: 'apps/storybook/visual/split-button.visual.spec.ts',
    tokenEvidence: ['packages/tokens/scripts/audit-material-web-split-button.mjs'],
    themeEvidence: ACTION_THEME_EVIDENCE,
  }),
  'toggle-button': actionDimensions({
    browserEvidence: 'apps/storybook/visual/toggle-button.visual.spec.ts',
    tokenEvidence: ['packages/tokens/scripts/toggle-button-css.test.mjs'],
  }),
};

const SELECTION_INVENTORY_EVIDENCE = 'apps/docs/scripts/material-conformance.mjs';
const SELECTION_SHARED_EVIDENCE =
  'apps/storybook/visual/selection-controls-conformance.visual.spec.ts';
const SELECTION_SSR_EVIDENCE = 'packages/ui/src/selection-controls.ssr.test.tsx';

function selectionDimensions({
  browserEvidence,
  tokenEvidence,
  apiEvidence = [],
  rtlEvidence = browserEvidence,
  motionEvidence = browserEvidence,
  themeEvidence = SELECTION_SHARED_EVIDENCE,
}) {
  return {
    api: requiredEvidence(
      SELECTION_INVENTORY_EVIDENCE,
      ...apiEvidence,
      browserEvidence,
    ),
    materialStatesVariants: requiredEvidence(browserEvidence),
    tokensVisuals: requiredEvidence(...tokenEvidence, browserEvidence),
    behavior: requiredEvidence(browserEvidence),
    accessibility: requiredEvidence(browserEvidence),
    rtlLocalization: requiredEvidence(rtlEvidence),
    motion: requiredEvidence(motionEvidence),
    theme: requiredEvidence(themeEvidence),
    browser: requiredEvidence(browserEvidence),
    ssr: requiredEvidence(SELECTION_SSR_EVIDENCE),
  };
}

const selectionFamilyDimensions = {
  checkbox: selectionDimensions({
    browserEvidence: 'apps/storybook/visual/checkbox.visual.spec.ts',
    apiEvidence: ['packages/ui/src/components/Checkbox/Checkbox.geometry.test.ts'],
    tokenEvidence: ['packages/tokens/scripts/audit-material-web-checkbox.mjs'],
    rtlEvidence: SELECTION_SHARED_EVIDENCE,
  }),
  'radio-button': selectionDimensions({
    browserEvidence: 'apps/storybook/visual/radio-button.visual.spec.ts',
    tokenEvidence: ['packages/tokens/scripts/audit-material-web-small-overlap.mjs'],
    rtlEvidence: SELECTION_SHARED_EVIDENCE,
    motionEvidence: SELECTION_SHARED_EVIDENCE,
  }),
  switch: selectionDimensions({
    browserEvidence: 'apps/storybook/visual/switch.visual.spec.ts',
    apiEvidence: ['packages/ui/src/components/Switch/Switch.defaults.test.ts'],
    tokenEvidence: ['packages/tokens/scripts/audit-material-web-switch.mjs'],
    motionEvidence: SELECTION_SHARED_EVIDENCE,
  }),
  slider: selectionDimensions({
    browserEvidence: 'apps/storybook/visual/slider.visual.spec.ts',
    tokenEvidence: ['packages/tokens/scripts/audit-material-web-slider.mjs'],
  }),
  'segmented-button': selectionDimensions({
    browserEvidence: 'apps/storybook/visual/segmented-button.visual.spec.ts',
    tokenEvidence: ['packages/tokens/scripts/audit-material-web-small-controls.mjs'],
  }),
};

const TEXT_SEARCH_INVENTORY_EVIDENCE = 'apps/docs/scripts/material-conformance.mjs';
const TEXT_SEARCH_SHARED_EVIDENCE =
  'apps/storybook/visual/text-search-conformance.visual.spec.ts';
const TEXT_SEARCH_SSR_EVIDENCE = 'packages/ui/src/text-search.ssr.test.tsx';
const TEXT_FIELD_VISUAL_EVIDENCE = 'apps/storybook/visual/text-field.visual.spec.ts';
const SECURE_TEXT_FIELD_VISUAL_EVIDENCE =
  'apps/storybook/visual/secure-text-field.visual.spec.ts';
const SEARCH_BAR_VISUAL_EVIDENCE = 'apps/storybook/visual/search-bar.visual.spec.ts';

const textSearchFamilyDimensions = {
  'text-field': {
    api: requiredEvidence(
      TEXT_SEARCH_INVENTORY_EVIDENCE,
      TEXT_FIELD_VISUAL_EVIDENCE,
      SECURE_TEXT_FIELD_VISUAL_EVIDENCE,
      TEXT_SEARCH_SHARED_EVIDENCE,
    ),
    materialStatesVariants: requiredEvidence(
      TEXT_FIELD_VISUAL_EVIDENCE,
      SECURE_TEXT_FIELD_VISUAL_EVIDENCE,
    ),
    tokensVisuals: requiredEvidence(
      'packages/tokens/scripts/audit-material-web-text-field.mjs',
      TEXT_FIELD_VISUAL_EVIDENCE,
      SECURE_TEXT_FIELD_VISUAL_EVIDENCE,
    ),
    behavior: requiredEvidence(
      TEXT_FIELD_VISUAL_EVIDENCE,
      SECURE_TEXT_FIELD_VISUAL_EVIDENCE,
      TEXT_SEARCH_SHARED_EVIDENCE,
    ),
    accessibility: requiredEvidence(
      TEXT_FIELD_VISUAL_EVIDENCE,
      SECURE_TEXT_FIELD_VISUAL_EVIDENCE,
      TEXT_SEARCH_SHARED_EVIDENCE,
    ),
    rtlLocalization: requiredEvidence(
      SECURE_TEXT_FIELD_VISUAL_EVIDENCE,
      TEXT_SEARCH_SHARED_EVIDENCE,
    ),
    motion: requiredEvidence(TEXT_SEARCH_SHARED_EVIDENCE),
    theme: requiredEvidence(TEXT_FIELD_VISUAL_EVIDENCE),
    browser: requiredEvidence(
      TEXT_FIELD_VISUAL_EVIDENCE,
      SECURE_TEXT_FIELD_VISUAL_EVIDENCE,
      TEXT_SEARCH_SHARED_EVIDENCE,
    ),
    ssr: requiredEvidence(TEXT_SEARCH_SSR_EVIDENCE),
  },
  'search-bar': {
    api: requiredEvidence(
      TEXT_SEARCH_INVENTORY_EVIDENCE,
      'packages/ui/src/components/SearchBar/SearchBar.defaults.test.ts',
      SEARCH_BAR_VISUAL_EVIDENCE,
      TEXT_SEARCH_SHARED_EVIDENCE,
    ),
    materialStatesVariants: requiredEvidence(SEARCH_BAR_VISUAL_EVIDENCE),
    tokensVisuals: requiredEvidence(
      'packages/tokens/scripts/audit-material-web-search.mjs',
      'packages/ui/src/components/SearchBar/SearchBar.defaults.test.ts',
      SEARCH_BAR_VISUAL_EVIDENCE,
    ),
    behavior: requiredEvidence(
      SEARCH_BAR_VISUAL_EVIDENCE,
      TEXT_SEARCH_SHARED_EVIDENCE,
    ),
    accessibility: requiredEvidence(
      SEARCH_BAR_VISUAL_EVIDENCE,
      TEXT_SEARCH_SHARED_EVIDENCE,
    ),
    rtlLocalization: requiredEvidence(SEARCH_BAR_VISUAL_EVIDENCE),
    motion: requiredEvidence(SEARCH_BAR_VISUAL_EVIDENCE),
    theme: requiredEvidence(TEXT_SEARCH_SHARED_EVIDENCE),
    browser: requiredEvidence(
      SEARCH_BAR_VISUAL_EVIDENCE,
      TEXT_SEARCH_SHARED_EVIDENCE,
    ),
    ssr: requiredEvidence(TEXT_SEARCH_SSR_EVIDENCE),
  },
};

const CONTENT_INVENTORY_EVIDENCE = 'apps/docs/scripts/material-conformance.mjs';
const CONTENT_SHARED_EVIDENCE =
  'apps/storybook/visual/content-primitives-conformance.visual.spec.ts';
const CONTENT_SSR_EVIDENCE = 'packages/ui/src/content-primitives.ssr.test.tsx';
const CHIP_VISUAL_EVIDENCE = 'apps/storybook/visual/chip.visual.spec.ts';
const MENU_VISUAL_EVIDENCE = 'apps/storybook/visual/menu.visual.spec.ts';
const EXPOSED_DROPDOWN_VISUAL_EVIDENCE =
  'apps/storybook/visual/exposed-dropdown-menu.visual.spec.ts';
const LIST_ITEM_VISUAL_EVIDENCE = 'apps/storybook/visual/list-item.visual.spec.ts';
const BADGE_VISUAL_EVIDENCE = 'apps/storybook/visual/badge.visual.spec.ts';
const DIVIDER_VISUAL_EVIDENCE = 'apps/storybook/visual/divider.visual.spec.ts';

const contentPrimitiveFamilyDimensions = {
  chip: {
    api: requiredEvidence(
      CONTENT_INVENTORY_EVIDENCE,
      'packages/ui/src/components/Chip/Chip.defaults.test.ts',
      CHIP_VISUAL_EVIDENCE,
    ),
    materialStatesVariants: requiredEvidence(CHIP_VISUAL_EVIDENCE),
    tokensVisuals: requiredEvidence(
      'packages/tokens/scripts/audit-material-web-chip.mjs',
      'packages/tokens/scripts/chip-css.test.mjs',
      CHIP_VISUAL_EVIDENCE,
    ),
    behavior: requiredEvidence(CHIP_VISUAL_EVIDENCE),
    accessibility: requiredEvidence(CHIP_VISUAL_EVIDENCE),
    rtlLocalization: requiredEvidence(CONTENT_SHARED_EVIDENCE),
    motion: requiredEvidence(CONTENT_SHARED_EVIDENCE),
    theme: requiredEvidence(CONTENT_SHARED_EVIDENCE),
    browser: requiredEvidence(CHIP_VISUAL_EVIDENCE, CONTENT_SHARED_EVIDENCE),
    ssr: requiredEvidence(CONTENT_SSR_EVIDENCE),
  },
  menu: {
    api: requiredEvidence(
      CONTENT_INVENTORY_EVIDENCE,
      'packages/ui/src/components/Menu/Menu.test.ts',
      'packages/ui/src/components/ExposedDropdownMenu/ExposedDropdownMenu.test.ts',
      MENU_VISUAL_EVIDENCE,
      EXPOSED_DROPDOWN_VISUAL_EVIDENCE,
    ),
    materialStatesVariants: requiredEvidence(
      MENU_VISUAL_EVIDENCE,
      EXPOSED_DROPDOWN_VISUAL_EVIDENCE,
    ),
    tokensVisuals: requiredEvidence(
      'packages/tokens/scripts/audit-material-web-menu.mjs',
      'packages/tokens/scripts/issue-178-static-css.test.mjs',
      MENU_VISUAL_EVIDENCE,
      EXPOSED_DROPDOWN_VISUAL_EVIDENCE,
    ),
    behavior: requiredEvidence(
      MENU_VISUAL_EVIDENCE,
      EXPOSED_DROPDOWN_VISUAL_EVIDENCE,
    ),
    accessibility: requiredEvidence(
      MENU_VISUAL_EVIDENCE,
      EXPOSED_DROPDOWN_VISUAL_EVIDENCE,
    ),
    rtlLocalization: requiredEvidence(
      MENU_VISUAL_EVIDENCE,
      EXPOSED_DROPDOWN_VISUAL_EVIDENCE,
    ),
    motion: requiredEvidence(MENU_VISUAL_EVIDENCE, CONTENT_SHARED_EVIDENCE),
    theme: requiredEvidence(CONTENT_SHARED_EVIDENCE),
    browser: requiredEvidence(
      MENU_VISUAL_EVIDENCE,
      EXPOSED_DROPDOWN_VISUAL_EVIDENCE,
      CONTENT_SHARED_EVIDENCE,
    ),
    ssr: requiredEvidence(CONTENT_SSR_EVIDENCE),
  },
  'list-item': {
    api: requiredEvidence(
      CONTENT_INVENTORY_EVIDENCE,
      'packages/ui/src/components/ListItem/ListItem.elevation.test.ts',
      LIST_ITEM_VISUAL_EVIDENCE,
    ),
    materialStatesVariants: requiredEvidence(LIST_ITEM_VISUAL_EVIDENCE),
    tokensVisuals: requiredEvidence(
      'packages/tokens/scripts/audit-material-web-list.mjs',
      'packages/tokens/scripts/list-item-css.test.mjs',
      LIST_ITEM_VISUAL_EVIDENCE,
    ),
    behavior: requiredEvidence(LIST_ITEM_VISUAL_EVIDENCE),
    accessibility: requiredEvidence(LIST_ITEM_VISUAL_EVIDENCE),
    rtlLocalization: requiredEvidence(LIST_ITEM_VISUAL_EVIDENCE),
    motion: requiredEvidence(CONTENT_SHARED_EVIDENCE),
    theme: requiredEvidence(CONTENT_SHARED_EVIDENCE),
    browser: requiredEvidence(LIST_ITEM_VISUAL_EVIDENCE, CONTENT_SHARED_EVIDENCE),
    ssr: requiredEvidence(CONTENT_SSR_EVIDENCE),
  },
  badge: {
    api: requiredEvidence(
      CONTENT_INVENTORY_EVIDENCE,
      'packages/ui/src/components/Badge/Badge.defaults.test.ts',
      BADGE_VISUAL_EVIDENCE,
    ),
    materialStatesVariants: requiredEvidence(BADGE_VISUAL_EVIDENCE),
    tokensVisuals: requiredEvidence(
      'packages/tokens/scripts/badge-css.test.mjs',
      BADGE_VISUAL_EVIDENCE,
    ),
    behavior: notApplicable(
      'Badge and BadgedBox are presentational content/positioning primitives. They expose no component-owned activation, selection, disclosure, or focus behavior.',
    ),
    accessibility: requiredEvidence(BADGE_VISUAL_EVIDENCE, CONTENT_SSR_EVIDENCE),
    rtlLocalization: requiredEvidence(BADGE_VISUAL_EVIDENCE),
    motion: notApplicable(
      'Badge and BadgedBox own no component transition or animation contract; consumers may animate surrounding content independently.',
    ),
    theme: requiredEvidence(CONTENT_SHARED_EVIDENCE),
    browser: requiredEvidence(BADGE_VISUAL_EVIDENCE, CONTENT_SHARED_EVIDENCE),
    ssr: requiredEvidence(CONTENT_SSR_EVIDENCE),
  },
  divider: {
    api: requiredEvidence(
      CONTENT_INVENTORY_EVIDENCE,
      'packages/ui/src/components/Divider/Divider.defaults.test.ts',
      DIVIDER_VISUAL_EVIDENCE,
    ),
    materialStatesVariants: requiredEvidence(DIVIDER_VISUAL_EVIDENCE),
    tokensVisuals: requiredEvidence(
      'packages/tokens/scripts/divider-css.test.mjs',
      DIVIDER_VISUAL_EVIDENCE,
    ),
    behavior: notApplicable(
      'Divider is a semantic separator with no component-owned activation, selection, disclosure, or focus behavior.',
    ),
    accessibility: requiredEvidence(DIVIDER_VISUAL_EVIDENCE, CONTENT_SSR_EVIDENCE),
    rtlLocalization: notApplicable(
      'Divider owns horizontal/vertical orientation but no start/end placement, directional content, or bidi-sensitive interaction.',
    ),
    motion: notApplicable(
      'Divider owns no transition or animation contract.',
    ),
    theme: requiredEvidence(CONTENT_SHARED_EVIDENCE),
    browser: requiredEvidence(DIVIDER_VISUAL_EVIDENCE, CONTENT_SHARED_EVIDENCE),
    ssr: requiredEvidence(CONTENT_SSR_EVIDENCE),
  },
};

const SURFACES_INVENTORY_EVIDENCE = 'apps/docs/scripts/material-conformance.mjs';
const SURFACES_SHARED_EVIDENCE =
  'apps/storybook/visual/surfaces-overlays-conformance.visual.spec.ts';
const SURFACES_SSR_EVIDENCE = 'packages/ui/src/surfaces-overlays.ssr.test.tsx';
const CARD_VISUAL_EVIDENCE = 'apps/storybook/visual/card.visual.spec.ts';
const SURFACE_VISUAL_EVIDENCE = 'apps/storybook/visual/surface.visual.spec.ts';
const DIALOG_VISUAL_EVIDENCE = 'apps/storybook/visual/dialog.visual.spec.ts';
const BOTTOM_SHEET_VISUAL_EVIDENCE =
  'apps/storybook/visual/bottom-sheet.visual.spec.ts';
const BOTTOM_SHEET_SCAFFOLD_VISUAL_EVIDENCE =
  'apps/storybook/visual/bottom-sheet-scaffold.visual.spec.ts';
const SCRIM_VISUAL_EVIDENCE = 'apps/storybook/visual/scrim.visual.spec.ts';

const surfaceOverlayFamilyDimensions = {
  card: {
    api: requiredEvidence(
      SURFACES_INVENTORY_EVIDENCE,
      'packages/ui/src/components/Card/Card.elevation.test.ts',
      CARD_VISUAL_EVIDENCE,
    ),
    materialStatesVariants: requiredEvidence(CARD_VISUAL_EVIDENCE),
    tokensVisuals: requiredEvidence(
      'packages/tokens/scripts/audit-material-web-card.mjs',
      CARD_VISUAL_EVIDENCE,
    ),
    behavior: requiredEvidence(CARD_VISUAL_EVIDENCE),
    accessibility: requiredEvidence(CARD_VISUAL_EVIDENCE, SURFACES_SSR_EVIDENCE),
    rtlLocalization: notApplicable(
      'Card owns a symmetric container and does not own directional slots, glyph mirroring, locale formatting, or bidi-sensitive placement. Directionality of card content belongs to consumer children.',
    ),
    motion: requiredEvidence(CARD_VISUAL_EVIDENCE, SURFACES_SHARED_EVIDENCE),
    theme: requiredEvidence(CARD_VISUAL_EVIDENCE, SURFACES_SHARED_EVIDENCE),
    browser: requiredEvidence(CARD_VISUAL_EVIDENCE, SURFACES_SHARED_EVIDENCE),
    ssr: requiredEvidence(SURFACES_SSR_EVIDENCE),
  },
  surface: {
    api: requiredEvidence(
      SURFACES_INVENTORY_EVIDENCE,
      'packages/ui/src/components/Surface/Surface.defaults.test.ts',
      SURFACE_VISUAL_EVIDENCE,
    ),
    materialStatesVariants: requiredEvidence(SURFACE_VISUAL_EVIDENCE),
    tokensVisuals: requiredEvidence(
      'packages/ui/src/components/Surface/Surface.defaults.test.ts',
      SURFACE_VISUAL_EVIDENCE,
    ),
    behavior: requiredEvidence(SURFACE_VISUAL_EVIDENCE),
    accessibility: requiredEvidence(SURFACE_VISUAL_EVIDENCE, SURFACES_SSR_EVIDENCE),
    rtlLocalization: notApplicable(
      'Surface owns no directional slots, placement policy, locale formatting, or glyph mirroring. Consumer content owns bidi-sensitive layout inside the surface.',
    ),
    motion: notApplicable(
      'Surface owns no component transition or animation contract. Interactive state feedback is delegated to the shared Ripple primitive, whose motion is tested at that shared boundary.',
    ),
    theme: requiredEvidence(SURFACE_VISUAL_EVIDENCE, SURFACES_SHARED_EVIDENCE),
    browser: requiredEvidence(SURFACE_VISUAL_EVIDENCE, SURFACES_SHARED_EVIDENCE),
    ssr: requiredEvidence(SURFACES_SSR_EVIDENCE),
  },
  dialog: {
    api: requiredEvidence(
      SURFACES_INVENTORY_EVIDENCE,
      'packages/ui/src/components/Dialog/Dialog.defaults.test.ts',
      DIALOG_VISUAL_EVIDENCE,
    ),
    materialStatesVariants: requiredEvidence(DIALOG_VISUAL_EVIDENCE),
    tokensVisuals: requiredEvidence(
      'packages/tokens/scripts/audit-material-web-dialog-sheet.mjs',
      'packages/tokens/scripts/feedback-overlays-css.test.mjs',
      DIALOG_VISUAL_EVIDENCE,
    ),
    behavior: requiredEvidence(DIALOG_VISUAL_EVIDENCE, SURFACES_SHARED_EVIDENCE),
    accessibility: requiredEvidence(
      DIALOG_VISUAL_EVIDENCE,
      SURFACES_SHARED_EVIDENCE,
      SURFACES_SSR_EVIDENCE,
    ),
    rtlLocalization: notApplicable(
      'Dialog owns container geometry and logical action alignment but no directional glyphs, localized formatting, or semantic ordering. Caller-provided content and actions own bidi-sensitive text/order.',
    ),
    motion: notApplicable(
      'The current Dialog renderer owns no component transition or animation in its CSS/runtime. React Aria owns modal lifecycle semantics; no synthetic Material animation contract is invented for this implementation.',
    ),
    theme: requiredEvidence(SURFACES_SHARED_EVIDENCE),
    browser: requiredEvidence(DIALOG_VISUAL_EVIDENCE, SURFACES_SHARED_EVIDENCE),
    ssr: requiredEvidence(SURFACES_SSR_EVIDENCE),
  },
  'bottom-sheet': {
    api: requiredEvidence(
      SURFACES_INVENTORY_EVIDENCE,
      'packages/ui/src/components/BottomSheet/BottomSheet.defaults.test.ts',
      'packages/ui/src/components/BottomSheet/SheetState.test.ts',
      'packages/ui/src/components/BottomSheetScaffold/BottomSheetScaffold.test.ts',
      BOTTOM_SHEET_VISUAL_EVIDENCE,
      BOTTOM_SHEET_SCAFFOLD_VISUAL_EVIDENCE,
    ),
    materialStatesVariants: requiredEvidence(
      BOTTOM_SHEET_VISUAL_EVIDENCE,
      BOTTOM_SHEET_SCAFFOLD_VISUAL_EVIDENCE,
    ),
    tokensVisuals: requiredEvidence(
      'packages/tokens/scripts/audit-material-web-dialog-sheet.mjs',
      'packages/tokens/scripts/feedback-overlays-css.test.mjs',
      BOTTOM_SHEET_VISUAL_EVIDENCE,
    ),
    behavior: requiredEvidence(
      'packages/ui/src/components/BottomSheet/SheetState.test.ts',
      'packages/ui/src/components/BottomSheetScaffold/BottomSheetScaffold.test.ts',
      BOTTOM_SHEET_VISUAL_EVIDENCE,
      BOTTOM_SHEET_SCAFFOLD_VISUAL_EVIDENCE,
    ),
    accessibility: requiredEvidence(
      BOTTOM_SHEET_VISUAL_EVIDENCE,
      BOTTOM_SHEET_SCAFFOLD_VISUAL_EVIDENCE,
      SURFACES_SHARED_EVIDENCE,
      SURFACES_SSR_EVIDENCE,
    ),
    rtlLocalization: notApplicable(
      'BottomSheet and BottomSheetScaffold own vertical anchors, centered sheet geometry, and modal/persistent lifecycle rather than start/end placement, directional icons, or locale formatting.',
    ),
    motion: requiredEvidence(
      BOTTOM_SHEET_VISUAL_EVIDENCE,
      BOTTOM_SHEET_SCAFFOLD_VISUAL_EVIDENCE,
    ),
    theme: requiredEvidence(BOTTOM_SHEET_VISUAL_EVIDENCE, SURFACES_SHARED_EVIDENCE),
    browser: requiredEvidence(
      BOTTOM_SHEET_VISUAL_EVIDENCE,
      BOTTOM_SHEET_SCAFFOLD_VISUAL_EVIDENCE,
      SURFACES_SHARED_EVIDENCE,
    ),
    ssr: requiredEvidence(SURFACES_SSR_EVIDENCE),
  },
  scrim: {
    api: requiredEvidence(
      SURFACES_INVENTORY_EVIDENCE,
      'packages/ui/src/components/Scrim/Scrim.defaults.test.ts',
      SCRIM_VISUAL_EVIDENCE,
    ),
    materialStatesVariants: requiredEvidence(SCRIM_VISUAL_EVIDENCE),
    tokensVisuals: requiredEvidence(
      'packages/tokens/scripts/audit-material-web-tooltip-snackbar-scrim.mjs',
      'packages/tokens/scripts/feedback-overlays-css.test.mjs',
      SCRIM_VISUAL_EVIDENCE,
    ),
    behavior: requiredEvidence(SCRIM_VISUAL_EVIDENCE),
    accessibility: requiredEvidence(SCRIM_VISUAL_EVIDENCE, SURFACES_SSR_EVIDENCE),
    rtlLocalization: notApplicable(
      'Scrim fills its owner uniformly and owns no directional content, start/end placement, glyph mirroring, or locale formatting.',
    ),
    motion: notApplicable(
      'Standalone Scrim owns no transition or animation contract. Overlay owners such as ModalBottomSheet own any animated scrim alpha and test that motion in their own family.',
    ),
    theme: requiredEvidence(SURFACES_SHARED_EVIDENCE),
    browser: requiredEvidence(SCRIM_VISUAL_EVIDENCE, SURFACES_SHARED_EVIDENCE),
    ssr: requiredEvidence(SURFACES_SSR_EVIDENCE),
  },
};

const FEEDBACK_STATUS_INVENTORY_EVIDENCE =
  'apps/docs/scripts/material-conformance.mjs';
const FEEDBACK_STATUS_SHARED_EVIDENCE =
  'apps/storybook/visual/feedback-status-conformance.visual.spec.ts';
const FEEDBACK_STATUS_SSR_EVIDENCE = 'packages/ui/src/feedback-status.ssr.test.tsx';
const PROGRESS_VISUAL_EVIDENCE =
  'apps/storybook/visual/progress-indicator.visual.spec.ts';
const LOADING_VISUAL_EVIDENCE =
  'apps/storybook/visual/loading-indicator.visual.spec.ts';
const SNACKBAR_VISUAL_EVIDENCE = 'apps/storybook/visual/snackbar.visual.spec.ts';
const TOOLTIP_VISUAL_EVIDENCE = 'apps/storybook/visual/tooltip.visual.spec.ts';

const feedbackStatusFamilyDimensions = {
  'progress-indicator': {
    api: requiredEvidence(
      FEEDBACK_STATUS_INVENTORY_EVIDENCE,
      'packages/ui/src/components/ProgressIndicator/ProgressIndicator.defaults.test.ts',
      PROGRESS_VISUAL_EVIDENCE,
    ),
    materialStatesVariants: requiredEvidence(PROGRESS_VISUAL_EVIDENCE),
    tokensVisuals: requiredEvidence(
      'packages/tokens/scripts/audit-material-web-progress-indicator.mjs',
      'packages/tokens/scripts/progress-indicator.test.mjs',
      PROGRESS_VISUAL_EVIDENCE,
    ),
    behavior: requiredEvidence(PROGRESS_VISUAL_EVIDENCE),
    accessibility: requiredEvidence(
      PROGRESS_VISUAL_EVIDENCE,
      FEEDBACK_STATUS_SSR_EVIDENCE,
    ),
    rtlLocalization: requiredEvidence(FEEDBACK_STATUS_SHARED_EVIDENCE),
    motion: requiredEvidence(PROGRESS_VISUAL_EVIDENCE),
    theme: requiredEvidence(FEEDBACK_STATUS_SHARED_EVIDENCE),
    browser: requiredEvidence(
      PROGRESS_VISUAL_EVIDENCE,
      FEEDBACK_STATUS_SHARED_EVIDENCE,
    ),
    ssr: requiredEvidence(FEEDBACK_STATUS_SSR_EVIDENCE),
  },
  'loading-indicator': {
    api: requiredEvidence(
      FEEDBACK_STATUS_INVENTORY_EVIDENCE,
      'packages/ui/src/components/LoadingIndicator/LoadingIndicator.motion.test.ts',
      LOADING_VISUAL_EVIDENCE,
    ),
    materialStatesVariants: requiredEvidence(LOADING_VISUAL_EVIDENCE),
    tokensVisuals: requiredEvidence(
      'packages/tokens/scripts/loading-indicator-css.test.mjs',
      'packages/tokens/scripts/progress-indicator.test.mjs',
      LOADING_VISUAL_EVIDENCE,
    ),
    behavior: requiredEvidence(
      'packages/ui/src/components/LoadingIndicator/LoadingIndicator.motion.test.ts',
      LOADING_VISUAL_EVIDENCE,
    ),
    accessibility: requiredEvidence(
      LOADING_VISUAL_EVIDENCE,
      FEEDBACK_STATUS_SSR_EVIDENCE,
    ),
    rtlLocalization: notApplicable(
      'LoadingIndicator is a symmetric circular renderer and owns no start/end placement, directional slots, glyph mirroring, or locale formatting.',
    ),
    motion: requiredEvidence(
      'packages/ui/src/components/LoadingIndicator/LoadingIndicator.motion.test.ts',
      LOADING_VISUAL_EVIDENCE,
    ),
    theme: requiredEvidence(FEEDBACK_STATUS_SHARED_EVIDENCE),
    browser: requiredEvidence(
      LOADING_VISUAL_EVIDENCE,
      FEEDBACK_STATUS_SHARED_EVIDENCE,
    ),
    ssr: requiredEvidence(FEEDBACK_STATUS_SSR_EVIDENCE),
  },
  snackbar: {
    api: requiredEvidence(
      FEEDBACK_STATUS_INVENTORY_EVIDENCE,
      'packages/ui/src/components/Snackbar/Snackbar.defaults.test.ts',
      SNACKBAR_VISUAL_EVIDENCE,
    ),
    materialStatesVariants: requiredEvidence(SNACKBAR_VISUAL_EVIDENCE),
    tokensVisuals: requiredEvidence(
      'packages/tokens/scripts/audit-material-web-tooltip-snackbar-scrim.mjs',
      'packages/tokens/scripts/feedback-overlays-css.test.mjs',
      SNACKBAR_VISUAL_EVIDENCE,
    ),
    behavior: requiredEvidence(SNACKBAR_VISUAL_EVIDENCE),
    accessibility: requiredEvidence(
      SNACKBAR_VISUAL_EVIDENCE,
      FEEDBACK_STATUS_SSR_EVIDENCE,
    ),
    rtlLocalization: requiredEvidence(FEEDBACK_STATUS_SHARED_EVIDENCE),
    motion: notApplicable(
      'Snackbar owns no entrance, exit, replacement, timeout, or host animation contract in the current component. Application state owns queue/timing lifecycle, while action state-layer motion belongs to the shared button/ripple boundary.',
    ),
    theme: requiredEvidence(FEEDBACK_STATUS_SHARED_EVIDENCE),
    browser: requiredEvidence(
      SNACKBAR_VISUAL_EVIDENCE,
      FEEDBACK_STATUS_SHARED_EVIDENCE,
    ),
    ssr: requiredEvidence(FEEDBACK_STATUS_SSR_EVIDENCE),
  },
  tooltip: {
    api: requiredEvidence(
      FEEDBACK_STATUS_INVENTORY_EVIDENCE,
      'packages/ui/src/components/Tooltip/Tooltip.defaults.test.ts',
      TOOLTIP_VISUAL_EVIDENCE,
    ),
    materialStatesVariants: requiredEvidence(TOOLTIP_VISUAL_EVIDENCE),
    tokensVisuals: requiredEvidence(
      'packages/tokens/scripts/audit-material-web-tooltip-snackbar-scrim.mjs',
      'packages/tokens/scripts/feedback-overlays-css.test.mjs',
      'packages/tokens/scripts/menu-tooltip.test.mjs',
      TOOLTIP_VISUAL_EVIDENCE,
    ),
    behavior: requiredEvidence(
      TOOLTIP_VISUAL_EVIDENCE,
      FEEDBACK_STATUS_SHARED_EVIDENCE,
    ),
    accessibility: requiredEvidence(
      TOOLTIP_VISUAL_EVIDENCE,
      FEEDBACK_STATUS_SHARED_EVIDENCE,
      FEEDBACK_STATUS_SSR_EVIDENCE,
    ),
    rtlLocalization: requiredEvidence(TOOLTIP_VISUAL_EVIDENCE),
    motion: requiredEvidence(
      TOOLTIP_VISUAL_EVIDENCE,
      FEEDBACK_STATUS_SHARED_EVIDENCE,
    ),
    theme: requiredEvidence(FEEDBACK_STATUS_SHARED_EVIDENCE),
    browser: requiredEvidence(
      TOOLTIP_VISUAL_EVIDENCE,
      FEEDBACK_STATUS_SHARED_EVIDENCE,
    ),
    ssr: requiredEvidence(FEEDBACK_STATUS_SSR_EVIDENCE),
  },
};

const PICKER_INVENTORY_EVIDENCE = 'apps/docs/scripts/material-conformance.mjs';
const PICKER_SHARED_EVIDENCE =
  'apps/storybook/visual/picker-conformance.visual.spec.ts';
const PICKER_SSR_EVIDENCE = 'packages/ui/src/pickers.ssr.test.tsx';
const DATE_PICKER_VISUAL_EVIDENCE =
  'apps/storybook/visual/date-picker.visual.spec.ts';
const TIME_PICKER_VISUAL_EVIDENCE =
  'apps/storybook/visual/time-picker.visual.spec.ts';
const PICKER_AUDIT_EVIDENCE =
  'packages/tokens/scripts/audit-material-web-pickers.mjs';
const PICKER_CSS_EVIDENCE = 'packages/tokens/scripts/pickers-css.test.mjs';
const PICKER_TOKEN_EVIDENCE = 'packages/tokens/scripts/pickers.test.mjs';

const pickerFamilyDimensions = {
  'date-picker': {
    api: requiredEvidence(
      PICKER_INVENTORY_EVIDENCE,
      'packages/ui/src/components/DatePicker/DatePicker.defaults.test.ts',
      DATE_PICKER_VISUAL_EVIDENCE,
    ),
    materialStatesVariants: requiredEvidence(DATE_PICKER_VISUAL_EVIDENCE),
    tokensVisuals: requiredEvidence(
      PICKER_AUDIT_EVIDENCE,
      PICKER_CSS_EVIDENCE,
      PICKER_TOKEN_EVIDENCE,
      DATE_PICKER_VISUAL_EVIDENCE,
    ),
    behavior: requiredEvidence(DATE_PICKER_VISUAL_EVIDENCE),
    accessibility: requiredEvidence(
      DATE_PICKER_VISUAL_EVIDENCE,
      PICKER_SSR_EVIDENCE,
    ),
    rtlLocalization: requiredEvidence(DATE_PICKER_VISUAL_EVIDENCE),
    motion: requiredEvidence(DATE_PICKER_VISUAL_EVIDENCE),
    theme: requiredEvidence(PICKER_SHARED_EVIDENCE),
    browser: requiredEvidence(
      DATE_PICKER_VISUAL_EVIDENCE,
      PICKER_SHARED_EVIDENCE,
    ),
    ssr: requiredEvidence(PICKER_SSR_EVIDENCE),
  },
  'time-picker': {
    api: requiredEvidence(
      PICKER_INVENTORY_EVIDENCE,
      'packages/ui/src/components/TimePicker/TimePicker.defaults.test.ts',
      TIME_PICKER_VISUAL_EVIDENCE,
    ),
    materialStatesVariants: requiredEvidence(TIME_PICKER_VISUAL_EVIDENCE),
    tokensVisuals: requiredEvidence(
      PICKER_AUDIT_EVIDENCE,
      PICKER_CSS_EVIDENCE,
      PICKER_TOKEN_EVIDENCE,
      TIME_PICKER_VISUAL_EVIDENCE,
    ),
    behavior: requiredEvidence(TIME_PICKER_VISUAL_EVIDENCE),
    accessibility: requiredEvidence(
      TIME_PICKER_VISUAL_EVIDENCE,
      PICKER_SSR_EVIDENCE,
    ),
    rtlLocalization: requiredEvidence(TIME_PICKER_VISUAL_EVIDENCE),
    motion: requiredEvidence(TIME_PICKER_VISUAL_EVIDENCE),
    theme: requiredEvidence(PICKER_SHARED_EVIDENCE),
    browser: requiredEvidence(
      TIME_PICKER_VISUAL_EVIDENCE,
      PICKER_SHARED_EVIDENCE,
    ),
    ssr: requiredEvidence(PICKER_SSR_EVIDENCE),
  },
};

const component = (id, sourcePrefixes, provenanceId = id, dimensions = openRequiredDimensions()) => ({
  id,
  kind: 'component',
  sourcePrefixes,
  provenance: { kind: 'component-docs', id: provenanceId },
  dimensions,
});

const directComponent = (id, sourcePrefixes, { family, materialUrl, evidence }) => ({
  id,
  kind: 'component',
  sourcePrefixes,
  provenance: {
    kind: 'direct',
    family,
    materialUrl,
    evidence,
  },
  dimensions: openRequiredDimensions(),
});

const layout = (id, sourcePrefixes, family) => ({
  id,
  kind: 'layout',
  sourcePrefixes,
  provenance: {
    kind: 'direct',
    family,
    contractLabel:
      'Jetpack Compose Material 3 adaptive layout/scaffold semantics as pinned and documented by the layout subsystem.',
    evidence: ['packages/ui/src/layout/README.md'],
  },
  dimensions: openRequiredDimensions(),
});

/**
 * Conformance ownership is declared by source module, never by a copied list of
 * exported symbol names. `material-conformance.mjs` resolves the actual public
 * symbols from the TypeScript package entrypoints and expands this registry.
 */
export const materialConformanceRegistry = {
  schemaVersion: 1,
  parentIssue: 296,
  rootEntrypoint: 'packages/ui/src/index.ts',
  layoutEntrypoint: 'packages/ui/src/layout/index.ts',
  nonComponents: [
    {
      id: 'theme-runtime',
      sourcePrefixes: ['packages/ui/src/theme/'],
      reason:
        'ThemeProvider, theme helpers, and theme types are public infrastructure rather than Material component or adaptive-layout families. ThemeProvider remains the runtime owner for system-resolved colors.',
    },
  ],
  families: [
    component('app-bar-column', ['packages/ui/src/components/AppBarColumn/']),
    component('app-bar-row', ['packages/ui/src/components/AppBarRow/']),
    component(
      'badge',
      ['packages/ui/src/components/Badge/'],
      'badge',
      contentPrimitiveFamilyDimensions.badge,
    ),
    component('bottom-app-bar', ['packages/ui/src/components/BottomAppBar/']),
    component(
      'bottom-sheet',
      [
        'packages/ui/src/components/BottomSheet/',
        'packages/ui/src/components/BottomSheetScaffold/',
      ],
      'bottom-sheet',
      surfaceOverlayFamilyDimensions['bottom-sheet'],
    ),
    component(
      'button',
      ['packages/ui/src/components/Button/'],
      'button',
      actionFamilyDimensions.button,
    ),
    component(
      'button-group',
      ['packages/ui/src/components/ButtonGroup/'],
      'button-group',
      actionFamilyDimensions['button-group'],
    ),
    component(
      'card',
      ['packages/ui/src/components/Card/'],
      'card',
      surfaceOverlayFamilyDimensions.card,
    ),
    component('carousel', ['packages/ui/src/components/Carousel/']),
    component(
      'checkbox',
      ['packages/ui/src/components/Checkbox/'],
      'checkbox',
      selectionFamilyDimensions.checkbox,
    ),
    component(
      'chip',
      ['packages/ui/src/components/Chip/'],
      'chip',
      contentPrimitiveFamilyDimensions.chip,
    ),
    component(
      'date-picker',
      ['packages/ui/src/components/DatePicker/'],
      'date-picker',
      pickerFamilyDimensions['date-picker'],
    ),
    component(
      'dialog',
      ['packages/ui/src/components/Dialog/'],
      'dialog',
      surfaceOverlayFamilyDimensions.dialog,
    ),
    component(
      'divider',
      ['packages/ui/src/components/Divider/'],
      'divider',
      contentPrimitiveFamilyDimensions.divider,
    ),
    component(
      'drag-handle',
      ['packages/ui/src/components/DragHandle/'],
      'vertical-drag-handle',
    ),
    component(
      'menu',
      [
        'packages/ui/src/components/Menu/',
        'packages/ui/src/components/ExposedDropdownMenu/',
      ],
      'menu',
      contentPrimitiveFamilyDimensions.menu,
    ),
    component(
      'fab',
      ['packages/ui/src/components/Fab/'],
      'fab',
      actionFamilyDimensions.fab,
    ),
    component(
      'fab-menu',
      ['packages/ui/src/components/FabMenu/'],
      'fab-menu',
      actionFamilyDimensions['fab-menu'],
    ),
    component('floating-toolbar', ['packages/ui/src/components/FloatingToolbar/']),
    component(
      'icon-button',
      ['packages/ui/src/components/IconButton/'],
      'icon-button',
      actionFamilyDimensions['icon-button'],
    ),
    component(
      'list-item',
      ['packages/ui/src/components/ListItem/'],
      'list-item',
      contentPrimitiveFamilyDimensions['list-item'],
    ),
    component(
      'loading-indicator',
      ['packages/ui/src/components/LoadingIndicator/'],
      'loading-indicator',
      feedbackStatusFamilyDimensions['loading-indicator'],
    ),
    directComponent(
      'navigation-bar',
      [
        'packages/ui/src/components/NavigationBar/',
        'packages/ui/src/components/ShortNavigationBar/',
      ],
      {
        family: 'Navigation bars',
        materialUrl: 'https://m3.material.io/components/navigation-bar/overview',
        evidence: ['apps/docs/content/docs/components/navigation-bar.mdx'],
      },
    ),
    directComponent(
      'navigation-drawer',
      ['packages/ui/src/components/NavigationDrawer/'],
      {
        family: 'Navigation drawers',
        materialUrl: 'https://m3.material.io/components/navigation-drawer/overview',
        evidence: ['apps/docs/content/docs/components/navigation-drawer.mdx'],
      },
    ),
    directComponent(
      'navigation-rail',
      [
        'packages/ui/src/components/NavigationRail/',
        'packages/ui/src/components/WideNavigationRail/',
      ],
      {
        family: 'Navigation rails',
        materialUrl: 'https://m3.material.io/components/navigation-rail/overview',
        evidence: ['apps/docs/content/docs/components/navigation-rail.mdx'],
      },
    ),
    component('non-interactive-scrollbar', [
      'packages/ui/src/components/NonInteractiveScrollbar/',
    ]),
    component(
      'progress-indicator',
      ['packages/ui/src/components/ProgressIndicator/'],
      'progress-indicator',
      feedbackStatusFamilyDimensions['progress-indicator'],
    ),
    component('pull-to-refresh', ['packages/ui/src/components/PullToRefresh/']),
    component(
      'radio-button',
      ['packages/ui/src/components/RadioButton/'],
      'radio-button',
      selectionFamilyDimensions['radio-button'],
    ),
    component(
      'scrim',
      ['packages/ui/src/components/Scrim/'],
      'scrim',
      surfaceOverlayFamilyDimensions.scrim,
    ),
    component('scroll-field', ['packages/ui/src/components/ScrollField/']),
    component(
      'search-bar',
      ['packages/ui/src/components/SearchBar/'],
      'search-bar',
      textSearchFamilyDimensions['search-bar'],
    ),
    component(
      'segmented-button',
      ['packages/ui/src/components/SegmentedButton/'],
      'segmented-button',
      selectionFamilyDimensions['segmented-button'],
    ),
    component(
      'slider',
      ['packages/ui/src/components/Slider/'],
      'slider',
      selectionFamilyDimensions.slider,
    ),
    component(
      'snackbar',
      ['packages/ui/src/components/Snackbar/'],
      'snackbar',
      feedbackStatusFamilyDimensions.snackbar,
    ),
    component(
      'split-button',
      ['packages/ui/src/components/SplitButton/'],
      'split-button',
      actionFamilyDimensions['split-button'],
    ),
    component(
      'surface',
      ['packages/ui/src/components/Surface/'],
      'surface',
      surfaceOverlayFamilyDimensions.surface,
    ),
    component('swipe-to-dismiss-box', ['packages/ui/src/components/SwipeToDismissBox/']),
    component(
      'switch',
      ['packages/ui/src/components/Switch/'],
      'switch',
      selectionFamilyDimensions.switch,
    ),
    component('tabs', ['packages/ui/src/components/Tabs/']),
    component(
      'text-field',
      ['packages/ui/src/components/TextField/'],
      'text-field',
      textSearchFamilyDimensions['text-field'],
    ),
    component(
      'time-picker',
      ['packages/ui/src/components/TimePicker/'],
      'time-picker',
      pickerFamilyDimensions['time-picker'],
    ),
    component(
      'toggle-button',
      ['packages/ui/src/components/ToggleButton/'],
      'toggle-button',
      actionFamilyDimensions['toggle-button'],
    ),
    component(
      'tooltip',
      ['packages/ui/src/components/Tooltip/'],
      'tooltip',
      feedbackStatusFamilyDimensions.tooltip,
    ),
    component('top-app-bar', ['packages/ui/src/components/TopAppBar/']),

    layout(
      'layout-scaffold',
      ['packages/ui/src/layout/components/Scaffold/'],
      'Scaffold',
    ),
    layout(
      'layout-three-pane-scaffold',
      ['packages/ui/src/layout/components/ThreePaneScaffold/'],
      'Three-pane scaffold',
    ),
    layout(
      'layout-list-detail-pane-scaffold',
      ['packages/ui/src/layout/components/ListDetailPaneScaffold/'],
      'List-detail pane scaffold',
    ),
    layout(
      'layout-supporting-pane-scaffold',
      ['packages/ui/src/layout/components/SupportingPaneScaffold/'],
      'Supporting-pane scaffold',
    ),
    layout(
      'layout-navigation-suite-scaffold',
      ['packages/ui/src/layout/components/NavigationSuiteScaffold/'],
      'Navigation-suite scaffold',
    ),
    layout(
      'layout-adaptive-core',
      ['packages/ui/src/layout/adaptive/'],
      'Adaptive window, posture, pane, navigation, and motion contracts',
    ),
  ],
};