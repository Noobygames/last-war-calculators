import { useState, useMemo } from 'react';
import HERO_DATA_RAW from '../data/heroes.json';
import type { HeroBase } from '../types';

const HERO_DATA = HERO_DATA_RAW as HeroBase[];

interface HeroSelectionModalProps {
  isOpen: boolean;
  onSelect: (heroId: string) => void;
  onClose: () => void;
}

export default function HeroSelectionModal({ isOpen, onSelect, onClose }: HeroSelectionModalProps) {
  const [filter, setFilter] = useState("All");
  
  if (!isOpen) return null;

  const filteredHeroes = useMemo(() => HERO_DATA.filter(hero => {
    if (filter === "All") return true;
    return hero.cat === filter;
  }), [filter]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-surface-main border border-surface-border rounded-2xl shadow-2xl w-full max-w-lg h-[80vh] flex flex-col overflow-hidden animate-appear" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-surface-card flex justify-between items-center bg-surface-dark">
          <h3 className="text-lg font-black text-white uppercase italic tracking-wider">Select Hero</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-2 flex gap-2 bg-surface-main border-b border-surface-card">
           {['All', 'Tank', 'Aircraft', 'Missile'].map(cat => (
            <button 
              type="button"
              key={cat}
              onClick={() => setFilter(cat)}
              className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-colors ${filter === cat ? 'bg-primary-action text-white' : 'bg-surface-card text-gray-400 hover:bg-surface-border'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-3 sm:grid-cols-4 gap-3 content-start">
          {filteredHeroes.map(hero => (
            <button
              type="button"
              key={hero.id}
              onClick={() => onSelect(hero.id)}
              className="flex flex-col items-center gap-2 p-2 rounded-xl bg-surface-dark border border-surface-card hover:border-primary hover:bg-surface-main transition-all group"
            >
              <div className="size-12 sm:size-16 relative">
                 <img 
                  src={`img/${hero.id}.png`} 
                  onError={(e) => { (e.target as HTMLImageElement).src = 'img/new-turtle.png'; (e.target as HTMLImageElement).style.opacity = '0.5'; }}
                  className="size-full object-contain rounded-lg group-hover:scale-110 transition-transform"
                  alt={hero.name}
                />
              </div>
              <div className="text-[10px] font-bold text-gray-300 uppercase truncate w-full text-center">{hero.name}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}