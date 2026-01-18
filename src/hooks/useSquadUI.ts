import { useState } from "react";
import HERO_DATA_RAW from "../data/heroes.json";
import type { AppDB, HeroBase } from "../types";

const HERO_DATA = HERO_DATA_RAW as HeroBase[];

interface UseSquadUIProps {
  db: AppDB;
  performAssignHero: (heroId: string, slotIdx: number) => void;
}

export function useSquadUI({ db, performAssignHero }: UseSquadUIProps) {
  const [dontAskMoveConfirmation, setDontAskMoveConfirmation] = useState(() => {
    return localStorage.getItem("dr_analyst_dont_ask_move") === "true";
  });

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm: (dontAskAgain: boolean) => void;
  }>({
    isOpen: false,
    message: "",
    onConfirm: () => {},
  });

  const [selectionModalConfig, setSelectionModalConfig] = useState<{
    isOpen: boolean;
    slotIdx: number | null;
  }>({
    isOpen: false,
    slotIdx: null,
  });

  const closeModal = () => setModalConfig((prev) => ({ ...prev, isOpen: false }));
  const openSelectionModal = (slotIdx: number) => setSelectionModalConfig({ isOpen: true, slotIdx });
  const closeSelectionModal = () => setSelectionModalConfig({ isOpen: false, slotIdx: null });

  const assignHeroWithConfirmation = (heroId: string, slotIdx: number) => {
    const heroBase = HERO_DATA.find((h) => h.id === heroId);
    if (!heroBase) return;

    let existingSquadIdx = -1;
    let existingSlotIdx = -1;

    for (let i = 0; i < db.squads.length; i++) {
      const s = db.squads[i];
      const idx = s.slots.findIndex((slot) => slot?.id === heroId);
      if (idx !== -1) {
        existingSquadIdx = i;
        existingSlotIdx = idx;
        break;
      }
    }

    if (existingSquadIdx !== -1) {
      if (existingSquadIdx === db.currentSquadIdx && existingSlotIdx === slotIdx) return;
      if (dontAskMoveConfirmation) {
        performAssignHero(heroId, slotIdx);
        return;
      }
      const squadName = db.squads[existingSquadIdx].name || `Squad ${existingSquadIdx + 1}`;
      const confirmMsg = `${heroBase.name} is already assigned to ${squadName}.\nDo you want to move them here?`;
      setModalConfig({
        isOpen: true,
        message: confirmMsg,
        onConfirm: (dontAskAgain: boolean) => {
          if (dontAskAgain) {
            setDontAskMoveConfirmation(true);
            localStorage.setItem("dr_analyst_dont_ask_move", "true");
          }
          performAssignHero(heroId, slotIdx);
          closeModal();
        },
      });
      return;
    }
    performAssignHero(heroId, slotIdx);
  };

  const selectHeroForSlot = (heroId: string) => {
    if (selectionModalConfig.slotIdx !== null) {
      assignHeroWithConfirmation(heroId, selectionModalConfig.slotIdx);
      closeSelectionModal();
    }
  };

  return { modalConfig, closeModal, selectionModalConfig, openSelectionModal, closeSelectionModal, assignHero: assignHeroWithConfirmation, selectHeroForSlot };
}