import { createContext, useContext, ReactNode } from 'react';
import { useSquadManager } from '../hooks/useSquadManager';

type SquadManagerType = ReturnType<typeof useSquadManager>;

const SquadContext = createContext<SquadManagerType | null>(null);

export function SquadProvider({ children }: { children: ReactNode }) {
  const squadManager = useSquadManager();

  return (
    <SquadContext.Provider value={squadManager}>
      {children}
    </SquadContext.Provider>
  );
}

export function useSquad() {
  const context = useContext(SquadContext);
  if (!context) {
    throw new Error("useSquad must be used within a SquadProvider");
  }
  return context;
}