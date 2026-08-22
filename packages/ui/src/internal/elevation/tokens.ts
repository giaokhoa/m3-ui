import * as token from '@m3/tokens';
import { msNumber, pxNumber } from '../tokenValues';

export const elevationLevels = {
  level0: pxNumber(token.ElevationLevel0),
  level1: pxNumber(token.ElevationLevel1),
  level2: pxNumber(token.ElevationLevel2),
  level3: pxNumber(token.ElevationLevel3),
  level4: pxNumber(token.ElevationLevel4),
  level5: pxNumber(token.ElevationLevel5),
} as const;

export type ElevationLevel = keyof typeof elevationLevels;

export interface ElevationShadowLayer {
  readonly offsetX: number;
  readonly offsetY: number;
  readonly blurRadius: number;
  readonly spreadRadius: number;
  readonly opacity: number;
}

export const elevationMotionTokens = {
  incoming: {
    durationMs: msNumber(token.MotionElevationIncomingDuration),
    easing: token.MotionElevationIncomingEasing,
  },
  outgoing: {
    durationMs: msNumber(token.MotionElevationOutgoingDuration),
    easing: token.MotionElevationOutgoingEasing,
  },
  hoveredOutgoing: {
    durationMs: msNumber(token.MotionElevationHoveredOutgoingDuration),
    easing: token.MotionElevationHoveredOutgoingEasing,
  },
} as const;

function layer(
  offsetX: string,
  offsetY: string,
  blurRadius: string,
  spreadRadius: string,
  opacity: number,
): ElevationShadowLayer {
  return {
    offsetX: pxNumber(offsetX),
    offsetY: pxNumber(offsetY),
    blurRadius: pxNumber(blurRadius),
    spreadRadius: pxNumber(spreadRadius),
    opacity,
  };
}

export const elevationShadowLayers = {
  level0: [
    layer(token.ElevationShadowLevel0Layer1OffsetX, token.ElevationShadowLevel0Layer1OffsetY, token.ElevationShadowLevel0Layer1BlurRadius, token.ElevationShadowLevel0Layer1SpreadRadius, token.ElevationShadowLevel0Layer1Opacity),
    layer(token.ElevationShadowLevel0Layer2OffsetX, token.ElevationShadowLevel0Layer2OffsetY, token.ElevationShadowLevel0Layer2BlurRadius, token.ElevationShadowLevel0Layer2SpreadRadius, token.ElevationShadowLevel0Layer2Opacity),
    layer(token.ElevationShadowLevel0Layer3OffsetX, token.ElevationShadowLevel0Layer3OffsetY, token.ElevationShadowLevel0Layer3BlurRadius, token.ElevationShadowLevel0Layer3SpreadRadius, token.ElevationShadowLevel0Layer3Opacity),
  ],
  level1: [
    layer(token.ElevationShadowLevel1Layer1OffsetX, token.ElevationShadowLevel1Layer1OffsetY, token.ElevationShadowLevel1Layer1BlurRadius, token.ElevationShadowLevel1Layer1SpreadRadius, token.ElevationShadowLevel1Layer1Opacity),
    layer(token.ElevationShadowLevel1Layer2OffsetX, token.ElevationShadowLevel1Layer2OffsetY, token.ElevationShadowLevel1Layer2BlurRadius, token.ElevationShadowLevel1Layer2SpreadRadius, token.ElevationShadowLevel1Layer2Opacity),
    layer(token.ElevationShadowLevel1Layer3OffsetX, token.ElevationShadowLevel1Layer3OffsetY, token.ElevationShadowLevel1Layer3BlurRadius, token.ElevationShadowLevel1Layer3SpreadRadius, token.ElevationShadowLevel1Layer3Opacity),
  ],
  level2: [
    layer(token.ElevationShadowLevel2Layer1OffsetX, token.ElevationShadowLevel2Layer1OffsetY, token.ElevationShadowLevel2Layer1BlurRadius, token.ElevationShadowLevel2Layer1SpreadRadius, token.ElevationShadowLevel2Layer1Opacity),
    layer(token.ElevationShadowLevel2Layer2OffsetX, token.ElevationShadowLevel2Layer2OffsetY, token.ElevationShadowLevel2Layer2BlurRadius, token.ElevationShadowLevel2Layer2SpreadRadius, token.ElevationShadowLevel2Layer2Opacity),
    layer(token.ElevationShadowLevel2Layer3OffsetX, token.ElevationShadowLevel2Layer3OffsetY, token.ElevationShadowLevel2Layer3BlurRadius, token.ElevationShadowLevel2Layer3SpreadRadius, token.ElevationShadowLevel2Layer3Opacity),
  ],
  level3: [
    layer(token.ElevationShadowLevel3Layer1OffsetX, token.ElevationShadowLevel3Layer1OffsetY, token.ElevationShadowLevel3Layer1BlurRadius, token.ElevationShadowLevel3Layer1SpreadRadius, token.ElevationShadowLevel3Layer1Opacity),
    layer(token.ElevationShadowLevel3Layer2OffsetX, token.ElevationShadowLevel3Layer2OffsetY, token.ElevationShadowLevel3Layer2BlurRadius, token.ElevationShadowLevel3Layer2SpreadRadius, token.ElevationShadowLevel3Layer2Opacity),
    layer(token.ElevationShadowLevel3Layer3OffsetX, token.ElevationShadowLevel3Layer3OffsetY, token.ElevationShadowLevel3Layer3BlurRadius, token.ElevationShadowLevel3Layer3SpreadRadius, token.ElevationShadowLevel3Layer3Opacity),
  ],
  level4: [
    layer(token.ElevationShadowLevel4Layer1OffsetX, token.ElevationShadowLevel4Layer1OffsetY, token.ElevationShadowLevel4Layer1BlurRadius, token.ElevationShadowLevel4Layer1SpreadRadius, token.ElevationShadowLevel4Layer1Opacity),
    layer(token.ElevationShadowLevel4Layer2OffsetX, token.ElevationShadowLevel4Layer2OffsetY, token.ElevationShadowLevel4Layer2BlurRadius, token.ElevationShadowLevel4Layer2SpreadRadius, token.ElevationShadowLevel4Layer2Opacity),
    layer(token.ElevationShadowLevel4Layer3OffsetX, token.ElevationShadowLevel4Layer3OffsetY, token.ElevationShadowLevel4Layer3BlurRadius, token.ElevationShadowLevel4Layer3SpreadRadius, token.ElevationShadowLevel4Layer3Opacity),
  ],
  level5: [
    layer(token.ElevationShadowLevel5Layer1OffsetX, token.ElevationShadowLevel5Layer1OffsetY, token.ElevationShadowLevel5Layer1BlurRadius, token.ElevationShadowLevel5Layer1SpreadRadius, token.ElevationShadowLevel5Layer1Opacity),
    layer(token.ElevationShadowLevel5Layer2OffsetX, token.ElevationShadowLevel5Layer2OffsetY, token.ElevationShadowLevel5Layer2BlurRadius, token.ElevationShadowLevel5Layer2SpreadRadius, token.ElevationShadowLevel5Layer2Opacity),
    layer(token.ElevationShadowLevel5Layer3OffsetX, token.ElevationShadowLevel5Layer3OffsetY, token.ElevationShadowLevel5Layer3BlurRadius, token.ElevationShadowLevel5Layer3SpreadRadius, token.ElevationShadowLevel5Layer3Opacity),
  ],
} as const satisfies Record<ElevationLevel, readonly ElevationShadowLayer[]>;
