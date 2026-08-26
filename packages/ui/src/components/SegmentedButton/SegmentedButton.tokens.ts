import * as token from '@m3/tokens';

interface TypographyTokens {
  readonly fontFamily: string;
  readonly fontSize: string;
  readonly lineHeight: string;
  readonly fontWeight: number;
  readonly letterSpacing: string;
}

const typography = {
  labelLarge: {
    fontFamily: token.TypographyLabelLargeFontFamily,
    fontSize: token.TypographyLabelLargeFontSize,
    lineHeight: token.TypographyLabelLargeLineHeight,
    fontWeight: token.TypographyLabelLargeFontWeight,
    letterSpacing: token.TypographyLabelLargeLetterSpacing,
  },
} as const satisfies Record<string, TypographyTokens>;

type TypographyRole = keyof typeof typography;

const shapeRadius = {
  full: token.ShapeFull,
  small: token.ShapeSmall,
  medium: token.ShapeMedium,
  large: token.ShapeLarge,
  extraLarge: token.ShapeExtraLarge,
} as const;

type ShapeRole = keyof typeof shapeRadius;

export const segmentedButtonTokens = {
  containerHeight: token.ComponentOutlinedSegmentedButtonContainerHeight,
  minWidth: token.ComponentButtonBaselineMinWidth,
  outlineColor: token.ComponentOutlinedSegmentedButtonOutlineColor,
  outlineWidth: token.ComponentOutlinedSegmentedButtonOutlineWidth,
  disabledOutlineColor: token.ComponentOutlinedSegmentedButtonDisabledOutlineColor,
  disabledOutlineOpacity: token.ComponentOutlinedSegmentedButtonDisabledOutlineOpacity,
  selectedContainerColor: token.ComponentOutlinedSegmentedButtonSelectedContainerColor,
  selectedIconColor: token.ComponentOutlinedSegmentedButtonSelectedIconColor,
  selectedHoverIconColor: token.ComponentOutlinedSegmentedButtonSelectedHoverIconColor,
  selectedFocusIconColor: token.ComponentOutlinedSegmentedButtonSelectedFocusIconColor,
  selectedPressedIconColor: token.ComponentOutlinedSegmentedButtonSelectedPressedIconColor,
  selectedLabelColor: token.ComponentOutlinedSegmentedButtonSelectedLabelTextColor,
  selectedHoverLabelColor: token.ComponentOutlinedSegmentedButtonSelectedHoverLabelTextColor,
  selectedFocusLabelColor: token.ComponentOutlinedSegmentedButtonSelectedFocusLabelTextColor,
  selectedPressedLabelColor: token.ComponentOutlinedSegmentedButtonSelectedPressedLabelTextColor,
  unselectedIconColor: token.ComponentOutlinedSegmentedButtonUnselectedIconColor,
  unselectedHoverIconColor: token.ComponentOutlinedSegmentedButtonUnselectedHoverIconColor,
  unselectedFocusIconColor: token.ComponentOutlinedSegmentedButtonUnselectedFocusIconColor,
  unselectedPressedIconColor: token.ComponentOutlinedSegmentedButtonUnselectedPressedIconColor,
  unselectedLabelColor: token.ComponentOutlinedSegmentedButtonUnselectedLabelTextColor,
  unselectedHoverLabelColor: token.ComponentOutlinedSegmentedButtonUnselectedHoverLabelTextColor,
  unselectedFocusLabelColor: token.ComponentOutlinedSegmentedButtonUnselectedFocusLabelTextColor,
  unselectedPressedLabelColor: token.ComponentOutlinedSegmentedButtonUnselectedPressedLabelTextColor,
  disabledIconColor: token.ComponentOutlinedSegmentedButtonDisabledIconColor,
  disabledIconOpacity: token.ComponentOutlinedSegmentedButtonDisabledIconOpacity,
  disabledLabelColor: token.ComponentOutlinedSegmentedButtonDisabledLabelTextColor,
  disabledLabelOpacity: token.ComponentOutlinedSegmentedButtonDisabledLabelTextOpacity,
  iconSize: token.ComponentOutlinedSegmentedButtonIconSize,
  shape: shapeRadius[token.ComponentOutlinedSegmentedButtonShape as ShapeRole],
  labelTypography:
    typography[token.ComponentOutlinedSegmentedButtonLabelTextFont as TypographyRole],
} as const;

export const segmentedButtonRuntime = {
  // AndroidX SegmentedButtonDefaults.ContentPadding at the pinned source uses 12.dp
  // for both logical inline edges; this value is not a generated component token.
  contentPaddingInline: '12px',
  // AndroidX SegmentedButton.kt keeps icon/label spacing as a private 8.dp runtime value.
  iconLabelSpacing: '8px',
  checkedZIndex: 5,
  interactionZIndex: 10,
  motion: {
    contentDisplacement: {
      duration: token.MotionSpringFastSpatialDuration,
      easing: token.MotionSpringFastSpatialEasing,
    },
    iconEffects: {
      duration: token.MotionSpringDefaultEffectsDuration,
      easing: token.MotionSpringDefaultEffectsEasing,
    },
  },
} as const;
