import { createContext, useContext } from 'react';

const AbsoluteTonalElevationContext = createContext(0);

export const AbsoluteTonalElevationProvider = AbsoluteTonalElevationContext.Provider;
export function useAbsoluteTonalElevation(): number {
  return useContext(AbsoluteTonalElevationContext);
}
