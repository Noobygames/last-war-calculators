import type { DragEvent } from 'react';
import { useState, useMemo } from 'react';
import HERO_DATA_RAW from '../data/heroes.json';
import type { HeroBase } from '../types';
import { useSquad } from '../context/SquadContext';

const HERO_DATA = HERO_DATA_RAW as HeroBase[];

export default function HeroStorage() {
  const { metaStatus } = useSquad();
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filteredHeroes = useMemo(() => HERO_DATA.filter(hero => {
      const matchesType = filter === "All" || hero.cat === filter;
      const matchesSearch = hero.name.toLowerCase().includes(search.toLowerCase());
      const isNerzi = hero.name === "Nerzi";
      if (isNerzi && !metaStatus.showNerzi) return false;
      return matchesType && matchesSearch;
    }), [filter, search, metaStatus.showNerzi]);

  const handleDragStart = (e: DragEvent, heroId: string) => {
    e.dataTransfer.setData("heroId", heroId);
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <aside className="hidden lg:flex lg:[@media(pointer:coarse)]:hidden w-64 xl:w-80 flex-shrink-0 bg-surface-main border-l border-surface-card flex-col overflow-hidden">
      <div className="p-6 border-b border-surface-card">
        <div className="text-xs font-black text-white uppercase italic mb-4">Hero Storage</div>
        
        <input 
          type="text" 
          placeholder="Search..." 
          className="w-full bg-black/40 border border-surface-border rounded px-2 py-1 text-xs text-white mb-2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex gap-1">
          {['All', 'Tank', 'Aircraft', 'Missile'].map(cat => (
            <button 
              type="button"
              key={cat}
              onClick={() => setFilter(cat)}
              className={`flex-1 text-[9px] uppercase font-bold py-1 rounded border ${filter === cat ? 'bg-primary-action border-primary text-white' : 'border-surface-border text-gray-400'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-3 no-scrollbar">
        {filteredHeroes.map(hero => (
          <div 
            key={hero.id}
            draggable
            onDragStart={(e) => handleDragStart(e, hero.id)}
            className="group cursor-grab active:cursor-grabbing hover:-translate-y-0.5 hover:brightness-[1.2] transition-all duration-200"
          >
            <div className="relative overflow-hidden rounded-lg border border-surface-card bg-surface-dark p-2 hover:border-primary transition-all">
              <div className="w-full h-16 flex items-center justify-center mb-1">
                <img 
                  src={`img/${hero.id}.png`} 
                  onError={(e) => { (e.target as HTMLImageElement).src = 'img/new-turtle.png'; (e.target as HTMLImageElement).style.opacity = '0.5'; }}
                  className="max-w-full max-h-full object-contain rounded opacity-80 group-hover:opacity-100 transition-opacity"
                  alt={hero.name}
                />
              </div>
              <div className="text-[9px] font-black text-white uppercase truncate text-center">{hero.name}</div>
              <div className="text-[7px] text-gray-500 uppercase text-center">{hero.cat}</div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
