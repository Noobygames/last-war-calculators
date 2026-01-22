import { useState } from "react";
import { useSquad } from "../context/SquadContext";
import { Tooltip } from "./Tooltip";
import type { GlobalBaseStats } from "../types";
import DamageReductionInfoModal from "./DamageReductionInfoModal";

interface GlobalStatsInputsProps {
  idPrefix: string;
}

export default function GlobalStatsInputs({ idPrefix }: GlobalStatsInputsProps) {
  const { db, updateGlobalStat } = useSquad();
  const globalStats = db.globalBaseStats;
  const [activeTab, setActiveTab] = useState<"Group 1" | "Group 3">("Group 1");
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  const renderChipInput = (label: string, key: keyof GlobalBaseStats, focusBorderColor: string, unitType: string) => (
    <div className="space-y-2">
      <Tooltip text={globalStats[key]?.description || `${unitType} ${label} Chip: Increases Damage Reduction`} className="w-full block">
        <label htmlFor={`${idPrefix}-${key}`} className="block text-[10px] font-bold text-gray-500 uppercase cursor-help hover:text-white transition-colors">
          {label}
        </label>
      </Tooltip>
      <input
        id={`${idPrefix}-${key}`}
        type="number"
        value={globalStats[key]?.level || ""}
        onChange={(e) => updateGlobalStat(key, e.target.value)}
        className={`w-full bg-black/40 border border-surface-card rounded-lg px-3 py-2 text-sm text-white outline-none transition-colors ${focusBorderColor}`}
        placeholder="0"
      />
    </div>
  );

  const renderUnitChips = (type: "Tank" | "Missile" | "Aircraft") => {
    const typeKey = type === "Aircraft" ? "ac" : type.toLowerCase();
    const titleColor = type === "Tank" ? "text-rarity-ur" : type === "Missile" ? "text-rarity-ssr" : "text-rarity-sr";
    const focusBorder = type === "Tank" ? "focus:border-rarity-ur" : type === "Missile" ? "focus:border-rarity-ssr" : "focus:border-rarity-sr";
    const squadKey = `drone_chip_${typeKey}_squad` as keyof GlobalBaseStats;

    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h4 className={`text-[9px] font-bold uppercase tracking-wider ${titleColor}`}>{type}</h4>
          <select
            value={globalStats[squadKey]?.level || 0}
            onChange={(e) => updateGlobalStat(squadKey, e.target.value)}
            className={`bg-black/40 border border-surface-card rounded px-2 py-0.5 text-[9px] text-white outline-none transition-colors ${focusBorder}`}>
            <option value="0">No Squad</option>
            <option value="1">Squad 1</option>
            <option value="2">Squad 2</option>
            <option value="3">Squad 3</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {renderChipInput("Quantum", `drone_quantum_chip_${typeKey}_lvl` as keyof GlobalBaseStats, focusBorder, type)}
          {renderChipInput("Memory", `drone_memory_chip_${typeKey}_lvl` as keyof GlobalBaseStats, focusBorder, type)}
        </div>
      </div>
    );
  };

  const renderGroup1 = () => (
    <div className="space-y-6 animate-appear">
      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-primary-highlight uppercase tracking-widest border-b border-primary/30 pb-1">Special Forces Tech</h3>
        <div className="grid grid-cols-2 gap-2">
          {(["sf_advanced_protection_1", "sf_advanced_protection_2"] as const).map((tech, i) => (
            <div key={tech} className="space-y-2">
              <Tooltip text={globalStats[tech]?.description || ""} className="w-full block">
                <label htmlFor={`${idPrefix}-${tech}`} className="block text-[10px] font-bold text-gray-500 uppercase cursor-help hover:text-white transition-colors">
                  Adv. Prot. {i + 1}
                </label>
              </Tooltip>
              <input
                id={`${idPrefix}-${tech}`}
                type="number"
                value={globalStats[tech]?.level || ""}
                onChange={(e) => updateGlobalStat(tech, e.target.value)}
                className="w-full bg-black/40 border border-surface-card rounded-lg px-3 py-2 text-sm text-white focus:border-primary outline-none transition-colors"
                placeholder="0"
                min="0"
                max="10"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-white uppercase tracking-widest border-b border-white/10 pb-1">Drone Chips</h3>
        {renderUnitChips("Tank")}
        {renderUnitChips("Missile")}
        {renderUnitChips("Aircraft")}
      </div>
    </div>
  );

  const renderGroup3 = () => (
    <div className="space-y-6 animate-appear">
      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-tertiary-soft uppercase tracking-widest border-b border-tertiary/30 pb-1">Drone</h3>
        <div className="space-y-2">
          <Tooltip text={globalStats.drone_lvl?.description || ""} className="w-full block">
            <label htmlFor={`${idPrefix}-drone_lvl`} className="block text-[10px] font-bold text-gray-500 uppercase cursor-help hover:text-white transition-colors">
              Drone Level
            </label>
          </Tooltip>
          <input
            id={`${idPrefix}-drone_lvl`}
            type="number"
            value={globalStats.drone_lvl?.level || ""}
            onChange={(e) => updateGlobalStat("drone_lvl", e.target.value)}
            className="w-full bg-black/40 border border-surface-card rounded-lg px-3 py-2 text-sm text-white focus:border-tertiary outline-none transition-colors"
            placeholder="0"
          />
          <p className="text-[9px] text-gray-500 italic">Provides 5% DR at Level 200+</p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-secondary-soft uppercase tracking-widest border-b border-secondary/30 pb-1">Decorations & Mastery</h3>
        <div className="space-y-2">
          <Tooltip text={globalStats.other_red?.description || ""} className="w-full block">
            <label htmlFor={`${idPrefix}-other_red`} className="block text-[10px] font-bold text-gray-500 uppercase cursor-help hover:text-white transition-colors">
              Other Reduction (%)
            </label>
          </Tooltip>
          <input
            id={`${idPrefix}-other_red`}
            type="number"
            value={globalStats.other_red?.level || ""}
            onChange={(e) => updateGlobalStat("other_red", e.target.value)}
            className="w-full bg-black/40 border border-surface-card rounded-lg px-3 py-2 text-sm text-white focus:border-secondary outline-none transition-colors"
            placeholder="0"
          />
          <p className="text-[9px] text-gray-500 italic">Sum of Decorations, Mastery Tech, War Leader Skill</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center px-1">
        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Configuration</span>
        <button 
          onClick={() => setIsInfoModalOpen(true)} 
          className="text-primary hover:text-primary-highlight transition-colors p-1"
          title="Show Info"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-4">
            <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <div className="flex p-1 bg-black/40 rounded-lg gap-1 border border-white/5">
        {(["Group 1", "Group 3"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded transition-all ${
              activeTab === tab ? "bg-surface-card text-white shadow-sm border border-white/10" : "text-gray-500 hover:text-gray-300 hover:bg-white/5 border border-transparent"
            }`}>
            {tab}
          </button>
        ))}
      </div>

      <div className="min-h-[200px]">
        {activeTab === "Group 1" && renderGroup1()}
        {activeTab === "Group 3" && renderGroup3()}
      </div>

      <DamageReductionInfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} />
    </div>
  );
}
