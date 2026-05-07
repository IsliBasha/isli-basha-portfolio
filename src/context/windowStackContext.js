import { createContext, useContext } from 'react';

export const WindowStackContext = createContext(null);

export function useWindowStack() {
  const ctx = useContext(WindowStackContext);
  if (!ctx) {
    throw new Error('useWindowStack must be used inside WindowStackProvider');
  }
  return ctx;
}
