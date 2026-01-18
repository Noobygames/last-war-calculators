import { useSquadState } from "./useSquadState";
import { useSquadCalculations } from "./useSquadCalculations";
import { useSquadUI } from "./useSquadUI";

export function useSquadManager() {
  const {
    db,
    currentSquad,
    updateGlobalStat,
    switchSquad,
    updateHeroSlot,
    updateSkill,
    performAssignHero,
    removeHero,
  } = useSquadState();

  const { metaStatus, calculateDR } = useSquadCalculations(db);

  const {
    modalConfig,
    closeModal,
    selectionModalConfig,
    openSelectionModal,
    closeSelectionModal,
    assignHero,
    selectHeroForSlot,
  } = useSquadUI({ db, performAssignHero });

  return {
    db,
    currentSquad,
    updateGlobalStat,
    switchSquad,
    updateHeroSlot,
    updateSkill,
    assignHero,
    removeHero,
    metaStatus,
    calculateDR,
    modalConfig,
    closeModal,
    selectionModalConfig,
    openSelectionModal,
    closeSelectionModal,
    selectHeroForSlot,
  };
}
