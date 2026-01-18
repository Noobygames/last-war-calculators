import React from 'react';
import { useSquad } from '../context/SquadContext';

interface SquadSlotProps {
  slotIdx: number;
}

// Interne Sub-Komponente für die Stats-Inputs
// Reduziert Codeduplizierung und verbessert die Lesbarkeit
const StatInput = ({ 
  label, 
  value, 
  onChange, 
  color 
}: { 
  label: string; 
  value: number; 
  onChange: (val: string) => void; 
  color: 'blue' | 'purple' | 'yellow';
}) => {
  const colors = {
    blue: { dot: 'bg-blue-500', text: 'text-blue-300', border: 'focus:border-blue-500' },
    purple: { dot: 'bg-purple-500', text: 'text-purple-300', border: 'focus:border-purple-500' },
    yellow: { dot: 'bg-yellow-500', text: 'text-yellow-300', border: 'focus:border-yellow-500' },
  }[color];

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <div className={`w-1 h-2.5 sm:h-3 ${colors.dot} rounded-full flex-shrink-0`}></div>
      <label className="text-[8px] sm:text-[9px] font-bold text-gray-400 w-5 sm:w-6 uppercase">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`min-w-0 flex-1 bg-gray-900/80 border border-white/10 rounded px-1 sm:px-2 py-0.5 text-[10px] sm:text-xs text-right ${colors.text} ${colors.border} outline-none transition-colors`}
      />
    </div>
  );
};

export default function SquadSlot({ 
  slotIdx
}: SquadSlotProps) {
  const { 
    currentSquad, 
    assignHero, 
    removeHero, 
    updateHeroSlot, 
    updateSkill, 
    metaStatus, 
    calculateDR, 
    openSelectionModal 
  } = useSquad();

  const hero = currentSquad.slots[slotIdx];
  const drStats = calculateDR(slotIdx);
  const isMeta = !!metaStatus.metaType;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add("drag-over");
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("drag-over");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove("drag-over");
    const heroId = e.dataTransfer.getData("heroId");
    if (heroId) assignHero(heroId, slotIdx);
  };

  const getDRColor = (val: number) => {
    if (val >= 85) return "text-red-500";
    if (val >= 70) return "text-yellow-400";
    return "text-blue-500";
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (hero.id) {
      e.dataTransfer.setData("heroId", hero.id);
      e.dataTransfer.setData("fromSlotIdx", slotIdx.toString());
      e.dataTransfer.effectAllowed = "move";
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`col-span-4 squad-slot aspect-[3/4] rounded-[1.5rem] border border-gray-700 bg-gray-900 relative overflow-hidden group hover:border-blue-500/50 transition-all duration-300 shadow-xl ${hero.id ? 'occupied' : ''} ${isMeta ? 'meta-active' : ''}`}
    >
      {!hero.id ? (
        <div 
          onClick={() => openSelectionModal(slotIdx)}
          className="absolute inset-0 z-0 flex flex-col items-center justify-center transition-opacity duration-300 cursor-pointer hover:bg-white/5"
        >
          <div className="text-5xl lg:text-6xl mb-2 opacity-20 grayscale group-hover:opacity-40 transition-opacity">🐢</div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold text-gray-600 group-hover:text-blue-500 transition-colors mb-1">+</span>
            <span className="text-[9px] font-black uppercase tracking-[0.15em] text-gray-600 group-hover:text-blue-400 transition-colors">Click to Add</span>
          </div>
        </div>
      ) : (
        <div className="relative z-10 w-full h-full flex flex-col cursor-pointer" onClick={() => openSelectionModal(slotIdx)} draggable={!!hero.id} onDragStart={handleDragStart}>
          <div className="absolute inset-0 z-0">
            <img
              src={`img/${hero.id}.png`}
              onError={(e) => { (e.target as HTMLImageElement).src = 'img/new-turtle.png'; }}
              className="absolute -right-10 -top-10 w-[110%] h-[110%] object-cover opacity-40 mix-blend-luminosity hero-skew pointer-events-none"
              alt="splash"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900/60 via-gray-900/80 to-black"></div>
          </div>

          <div className="relative z-10 flex items-start gap-3 p-3 md:p-4 pb-0 h-[45%]">
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 md:w-16 md:h-16 lg:w-20 lg:h-20 object-contain rounded-xl overflow-hidden border-2 border-gray-600 bg-gray-800 shadow-lg group-hover:border-blue-500/50 transition-colors">
              <img 
                src={`img/${hero.id}.png`} 
                onError={(e) => { (e.target as HTMLImageElement).src = 'img/placeholder.jpg'; }}
                className="w-full h-full object-cover" 
                alt={hero.name} 
              />
            </div>

            <div className="flex-1 flex flex-col justify-center min-w-0 pl-1 pr-8">
              <div className="flex justify-between items-center border-b border-white/5 pb-0.5 mb-0.5">
                <span className="text-[8px] sm:text-[9px] font-bold text-gray-500 uppercase tracking-tighter">Phys</span>
                <span className={`text-[10px] sm:text-sm md:text-[12px] lg:text-[16px] font-black italic leading-none ${getDRColor(drStats.phys)}`}>
                  {drStats.phys.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[8px] sm:text-[9px] font-bold text-gray-500 uppercase tracking-tighter">Ener</span>
                <span className={`text-[10px] sm:text-sm md:text-[12px] lg:text-[16px] font-black italic leading-none ${getDRColor(drStats.ener)}`}>
                  {drStats.ener.toFixed(1)}%
                </span>
              </div>
            </div>

            <button onClick={(e) => {
              e.stopPropagation();
              removeHero(slotIdx);
            }} className="absolute top-2 right-2 bg-black/60 text-red-500 hover:bg-red-600 hover:text-white transition-all p-2 rounded-full z-20 cursor-pointer shadow-sm border border-white/10 backdrop-blur-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          <div className="relative z-10 flex-1 flex flex-col px-2 sm:px-4 pb-2 sm:pb-4 gap-1.5 sm:gap-2 justify-end">
            <div className="text-[9px] sm:text-xs font-black text-center uppercase tracking-wider sm:tracking-[0.15em] text-white/90 bg-white/5 rounded py-0.5 sm:py-1 border border-white/5 truncate">
              {hero.name}
            </div>

            <div 
              className="grid grid-cols-1 gap-1 sm:gap-1.5 bg-black/40 rounded-lg sm:rounded-xl p-1.5 sm:p-2 border border-white/5"
              onClick={(e) => e.stopPropagation()}
            >
              <StatInput 
                label="EW" 
                value={hero.ex_lvl || 0} 
                onChange={(val) => updateHeroSlot(slotIdx, { ex_lvl: parseInt(val, 10) || 0 })} 
                color="blue" 
              />
              <StatInput 
                label="Pas" 
                value={hero.skills?.passive || 1} 
                onChange={(val) => updateSkill(slotIdx, 'passive_lvl', val)} 
                color="purple" 
              />
              <StatInput 
                label="Tac" 
                value={hero.skills?.tactics || 1} 
                onChange={(val) => updateSkill(slotIdx, 'tactics_lvl', val)} 
                color="yellow" 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
