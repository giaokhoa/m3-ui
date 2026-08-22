import * as token from '@m3/tokens/generated';
import { msNumber } from './value.js';

export const motionEasing = {
  linear: token.MotionEasingLinear,
  standard: token.MotionEasingStandard,
  standardAccelerate: token.MotionEasingStandardAccelerate,
  standardDecelerate: token.MotionEasingStandardDecelerate,
  emphasized: token.MotionEasingEmphasized,
  emphasizedAccelerate: token.MotionEasingEmphasizedAccelerate,
  emphasizedDecelerate: token.MotionEasingEmphasizedDecelerate,
} as const;

export const motionDurationMs = {
  short1: msNumber(token.MotionDurationShort1),
  short2: msNumber(token.MotionDurationShort2),
  short3: msNumber(token.MotionDurationShort3),
  short4: msNumber(token.MotionDurationShort4),
  medium1: msNumber(token.MotionDurationMedium1),
  medium2: msNumber(token.MotionDurationMedium2),
  medium3: msNumber(token.MotionDurationMedium3),
  medium4: msNumber(token.MotionDurationMedium4),
  long1: msNumber(token.MotionDurationLong1),
  long2: msNumber(token.MotionDurationLong2),
  long3: msNumber(token.MotionDurationLong3),
  long4: msNumber(token.MotionDurationLong4),
  extraLong1: msNumber(token.MotionDurationExtraLong1),
  extraLong2: msNumber(token.MotionDurationExtraLong2),
  extraLong3: msNumber(token.MotionDurationExtraLong3),
  extraLong4: msNumber(token.MotionDurationExtraLong4),
} as const;
