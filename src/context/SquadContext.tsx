import { createContext, useContext } from 'react';
import { useSquadManager } from '../hooks/useSquadManager';

type SquadManagerType = ReturnType<typeof useSquadManager>;

export const SquadContext = createContext<SquadManagerType | null>(null);

export function useSquad() {
  const context = useContext(SquadContext);
  if (!context) {
    throw new Error("useSquad must be used within a SquadProvider");
  }
  return context;
}
