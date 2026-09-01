import { Fragment, isValidElement, type ReactNode } from 'react';

function isIterableReactNode(value: ReactNode): value is Iterable<ReactNode> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !isValidElement(value) &&
    Symbol.iterator in value &&
    typeof value[Symbol.iterator] === 'function'
  );
}

/**
 * Returns whether a ReactNode has concrete renderable content.
 *
 * React uses null, undefined and booleans as empty conditional nodes. Empty
 * strings and fragments/iterables containing only empty nodes likewise emit no
 * DOM content. Keep numeric zero and non-empty strings because React renders
 * them visibly.
 */
export function hasReactNodeContent(value: ReactNode): boolean {
  if (value == null || typeof value === 'boolean') return false;
  if (typeof value === 'string') return value.length > 0;
  if (Array.isArray(value)) return value.some(hasReactNodeContent);

  if (isValidElement(value) && value.type === Fragment) {
    return hasReactNodeContent(
      (value.props as { children?: ReactNode }).children,
    );
  }

  if (isIterableReactNode(value)) {
    for (const child of value) {
      if (hasReactNodeContent(child)) return true;
    }
    return false;
  }

  return true;
}
