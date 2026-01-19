import { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import TacticalField from './components/TacticalField';
import HeroStorage from './components/HeroStorage';
import ConfirmationModal from './components/ConfirmationModal';
import HeroSelectionModal from './components/HeroSelectionModal';
import BaseStatsModal from './components/BaseStatsModal';
import { useSquad } from './context/SquadContext';
import { SquadProvider } from './context/SquadProvider';

function AppContent() {
  const { 
    removeHero,
    modalConfig,
    closeModal,
    selectionModalConfig,
    closeSelectionModal,
    selectHeroForSlot,
  } = useSquad();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div 
      className="bg-black text-white h-screen flex flex-col overflow-hidden font-sans"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const fromSlotIdx = e.dataTransfer.getData("fromSlotIdx");
        if (fromSlotIdx) {
          removeHero(parseInt(fromSlotIdx, 10));
        }
      }}
    >
      <Header 
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />

        <main 
          className="flex flex-1 flex-col items-center justify-center p-4 md:p-20 overflow-hidden bg-[image:radial-gradient(circle_at_center,var(--color-surface-main)_0%,var(--color-surface-dark)_50%,black_100%)] relative"
        >
          <TacticalField />
        </main>

        <HeroStorage />
      </div>

      {modalConfig.isOpen && (
        <ConfirmationModal 
          isOpen={modalConfig.isOpen}
          message={modalConfig.message}
          onConfirm={modalConfig.onConfirm}
          onCancel={closeModal}
        />
      )}

      {selectionModalConfig.isOpen && (
        <HeroSelectionModal 
          isOpen={selectionModalConfig.isOpen}
          onSelect={selectHeroForSlot}
          onClose={closeSelectionModal}
        />
      )}

      {isSettingsOpen && (
        <BaseStatsModal 
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <SquadProvider>
      <AppContent />
    </SquadProvider>
  );
}
