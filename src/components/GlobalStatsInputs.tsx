import { useSquad } from '../context/SquadContext';

interface GlobalStatsInputsProps {
  idPrefix: string;
}

export default function GlobalStatsInputs({ idPrefix }: GlobalStatsInputsProps) {
  const { db, updateGlobalStat } = useSquad();
  const globalStats = db.globalBaseStats;

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-primary-highlight uppercase tracking-widest border-b border-primary/30 pb-1">Technologie</h3>
        
        {(['sf_tech_1', 'sf_tech_2'] as const).map((tech, i) => (
          <div key={tech} className="space-y-2">
            <label htmlFor={`${idPrefix}-${tech}`} className="block text-[10px] font-bold text-gray-500 uppercase">SF Tech {i + 1} (Level 0-10)</label>
            <input
              id={`${idPrefix}-${tech}`}
              type="number"
              value={globalStats[tech]?.level || ''}
              onChange={(e) => updateGlobalStat(tech, e.target.value)}
              className="w-full bg-black/40 border border-surface-card rounded-lg px-3 py-2 text-sm text-white focus:border-primary outline-none transition-colors"
              placeholder="0"
              min="0"
              max="10"
            />
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-tertiary-soft uppercase tracking-widest border-b border-tertiary/30 pb-1">Drone</h3>
        <div className="space-y-2">
          <label htmlFor={`${idPrefix}-drone_lvl`} className="block text-[10px] font-bold text-gray-500 uppercase">Drone Level</label>
          <input
            id={`${idPrefix}-drone_lvl`}
            type="number"
            value={globalStats.drone_lvl?.level || ''}
            onChange={(e) => updateGlobalStat('drone_lvl', e.target.value)}
            className="w-full bg-black/40 border border-surface-card rounded-lg px-3 py-2 text-sm text-white focus:border-tertiary outline-none transition-colors"
            placeholder="0"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-secondary-soft uppercase tracking-widest border-b border-secondary/30 pb-1">Sonstiges</h3>
        <div className="space-y-2">
          <label htmlFor={`${idPrefix}-other_red`} className="block text-[10px] font-bold text-gray-500 uppercase">Andere Reduktion (%)</label>
          <input
            id={`${idPrefix}-other_red`}
            type="number"
            value={globalStats.other_red?.level || ''}
            onChange={(e) => updateGlobalStat('other_red', e.target.value)}
            className="w-full bg-black/40 border border-surface-card rounded-lg px-3 py-2 text-sm text-white focus:border-secondary outline-none transition-colors"
            placeholder="0"
          />
        </div>
      </div>
    </div>
  );
}
