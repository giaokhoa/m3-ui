import '@m3-ui/tokens/elevation.css';
import clsx from 'clsx';
import { useEffect, useRef, type CSSProperties, type HTMLAttributes } from 'react';
import {
  resolveElevationInteraction,
  resolveElevationLevel,
  resolveElevationTransition,
  type ElevationInteraction,
  type ElevationInteractionState,
  type ElevationLevels,
} from './interaction';
import type { ElevationLevel } from './tokens';
import './elevation.css';

type ElevationStyle = CSSProperties & Record<`--${string}`, string | number>;

type ElevationBaseProps = HTMLAttributes<HTMLSpanElement> & {
  shadowColor?: string;
};

type DirectElevationProps = {
  level?: ElevationLevel;
  levels?: never;
  state?: never;
};

type InteractiveElevationProps = {
  level?: never;
  levels: ElevationLevels;
  state: ElevationInteractionState;
};

export type ElevationProps = ElevationBaseProps &
  (DirectElevationProps | InteractiveElevationProps);

/**
 * Material elevation paint primitive and shared RAC-state resolver.
 *
 * Direct/static surfaces pass `level`. RAC-backed interactive controls pass a
 * semantic `levels` set plus normalized current `state`; this primitive applies
 * the repository-wide web precedence and owns any shared elevation-transition
 * history. Shadow geometry remains generated CSS, never React serialization.
 */
export function Elevation({
  level,
  levels,
  state,
  shadowColor,
  className,
  style,
  ...props
}: ElevationProps) {
  const isInteractive = levels !== undefined;
  const interaction = isInteractive
    ? resolveElevationInteraction(state)
    : null;
  const previousInteractionRef = useRef<ElevationInteraction>(null);
  const previousInteraction = previousInteractionRef.current;

  useEffect(() => {
    previousInteractionRef.current = isInteractive ? interaction : null;
  }, [interaction, isInteractive]);

  const resolvedLevel = isInteractive
    ? resolveElevationLevel(levels, state)
    : (level ?? 'level0');
  const transition = isInteractive
    ? resolveElevationTransition(state, interaction, previousInteraction)
    : undefined;

  const elevationStyle: ElevationStyle = {
    ...(shadowColor === undefined
      ? {}
      : { '--_elevation-shadow-color': shadowColor }),
    ...(transition === undefined ? {} : { transition }),
    ...style,
  };

  return (
    <span
      {...props}
      aria-hidden="true"
      className={clsx('elevation', className)}
      data-elevation={resolvedLevel}
      style={elevationStyle}
    />
  );
}
