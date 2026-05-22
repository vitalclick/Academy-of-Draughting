'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

type AidaContextValue = {
  open: boolean;
  setOpen: (v: boolean) => void;
  toggle: () => void;
};

const AidaContext = createContext<AidaContextValue | null>(null);

export function AidaProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((v) => !v), []);
  const value = useMemo(() => ({ open, setOpen, toggle }), [open, toggle]);
  return <AidaContext.Provider value={value}>{children}</AidaContext.Provider>;
}

export function useAida() {
  const ctx = useContext(AidaContext);
  if (!ctx) throw new Error('useAida must be used within AidaProvider');
  return ctx;
}
