import { type ReactNode } from 'react';
import { useSquadManager } from '../hooks/useSquadManager';
import { SquadContext } from './SquadContext';

export function SquadProvider({ children }: { children: ReactNode }) {
  const squadManager = useSquadManager();

  return (
    <SquadContext.Provider value={squadManager}>
      {children}
    </SquadContext.Provider>
  );
}