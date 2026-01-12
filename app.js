/**
 * DR ANALYST - PRO ENGINE (app.js)
 * Features: Exclusive Weapon scaling, 3-Skill Logic, Drag & Drop
 */

let HERO_DATA = [];
let currentSquad = 1;
let currentFilter = "All";
let searchQuery = "";
window.currentHeroStats = {};

let db = {
  global: 0.0,
  squads: {
    1: { slots: {} },
    2: { slots: {} },
    3: { slots: {} },
  },
};

/**
 * INITIALISIERUNG
 */
async function init() {
  try {
    // 1. Helden laden
    const customHeroes = localStorage.getItem("dr_analyst_custom_heroes");
    if (customHeroes) {
      HERO_DATA = JSON.parse(customHeroes);
    } else {
      const response = await fetch("heroes.json");
      if (!response.ok) throw new Error("Heroes JSON nicht gefunden");
      HERO_DATA = await response.json();
    }

    // 2. Datenbank / Squads laden
    const saved = localStorage.getItem("dr_analyst_v4_db");
    if (saved) {
      db = JSON.parse(saved);
    }

    // 3. UI Initialisieren
    // WICHTIG: Erst rendern, wenn HERO_DATA garantiert gefüllt ist!
    renderHeroStorage(false);
    switchSquad(1);

    console.log("System bereit. Helden im Speicher:", HERO_DATA.length);
  } catch (error) {
    console.error("Init fehlgeschlagen:", error);
    // Fallback: Falls alles crashed, leeres Array aber Code läuft weiter
    HERO_DATA = [];
  }
}

// Und am Ende der Datei der Startschuss:
init();
/**
 * RENDERER: LINKES LAGER
 */
// Wir setzen forceNerzi = false als Standardwert (Default Parameter)
function renderHeroStorage(forceNerzi = false) {
  const container = document.getElementById("hero-storage");
  if (!container) return;

  container.innerHTML = "";

  const filtered = HERO_DATA.filter((hero) => {
    const matchesType = currentFilter === "All" || hero.cat === currentFilter;
    const matchesSearch = hero.name.toLowerCase().includes(searchQuery);
    const isNerzi = hero.name === "Nerzi";

    // Nerzi Logik: Nur zeigen wenn forceNerzi true UND er zum Filter/Search passt
    if (isNerzi && !forceNerzi) return false;

    return matchesType && matchesSearch;
  });

  filtered.forEach((hero) => {
    // EASTER EGG LOGIK
    // Wenn der Held "Nerzi" heißt, wird er übersprungen,
    // AUSSER forceNerzi ist true.
    if (hero.name === "Nerzi" && !forceNerzi) {
      return;
    }

    const card = document.createElement("div");
    card.className = "hero-storage-card group"; // Stelle sicher, dass die CSS Klasse existiert
    card.draggable = true;
    card.ondragstart = (e) => handleDragStart(e, hero.id);

    card.innerHTML = `
            <div class="relative overflow-hidden rounded-lg border border-gray-800 bg-gray-950 p-2 hover:border-blue-500 transition-all">
                <img src="img/${hero.id}.png" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHRleHQgeT0iMjAiIGZvbnQtc2l6ZT0iMjAiPu88fDwvdGV4dD48L3N2Zz4='" 
                     class="w-full h-16 object-cover rounded mb-2 opacity-80 group-hover:opacity-100">
                <div class="text-[9px] font-black text-white uppercase truncate">${hero.name}</div>
                <div class="text-[7px] text-gray-500 uppercase">${hero.cat}</div>
            </div>
        `;
    container.appendChild(card);
  });

  // Counter aktualisieren
  const countEl = document.getElementById("hero-count");
  if (countEl) countEl.innerText = container.children.length;
}

function handleDragStart(e, heroId) {
  // Wir speichern die ID des Helden im "Datentransport" des Browsers
  e.dataTransfer.setData("text/plain", heroId);
  e.dataTransfer.effectAllowed = "move";

  // Optional: Ein kleiner visueller Effekt für die Karte, die man gerade zieht
  e.target.style.opacity = "0.5";
}

function handleDragOver(e) {
  // WICHTIG: Verhindert das Standardverhalten, damit "Drop" erlaubt wird
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
}

function handleDrop(e, slotIdx) {
  e.preventDefault();
  const heroId = e.dataTransfer.getData("text/plain") || e.dataTransfer.getData("text");
  if (!heroId) return;

  const hero = HERO_DATA.find((h) => h.id === heroId);
  if (!hero) return;

  // Check ob Held schon in anderem Squad
  let existingSquad = null;
  for (let sId in db.squads) {
    const slots = Array.isArray(db.squads[sId].slots) ? db.squads[sId].slots : Object.values(db.squads[sId].slots);
    if (slots.some((s) => s && s.id === heroId) && parseInt(sId) !== currentSquad) {
      existingSquad = sId;
      break;
    }
  }

  if (existingSquad) {
    showToast(`Hero already in Squad ${existingSquad}!`, "error");
    return;
  }

  // Struktur sicherstellen
  if (!db.squads[currentSquad].slots) db.squads[currentSquad].slots = {};

  db.squads[currentSquad].slots[slotIdx] = {
    id: hero.id,
    ex_lvl: 0,
    skills: { tactics: 1, passive: 1 },
  };

  saveAndRefresh();
}

// function handleDrop(e, slotIdx) {
//   e.preventDefault();
//   const heroId = e.dataTransfer.getData("text/plain");
//   const hero = HERO_DATA.find((h) => h.id === heroId);

//   if (hero) {
//     // Wir wandeln ALLES in Arrays um, um sicher zu gehen
//     const allSquads = Object.values(db.squads);

//     const isUsed = allSquads.some((squad) => {
//       // Falls slots ein Objekt ist, machen wir ein Array daraus
//       const slotList = Array.isArray(squad.slots) ? squad.slots : Object.values(squad.slots);
//       return slotList.some((slot) => slot && slot.id === heroId);
//     });

//     if (isUsed) {
//       showToast(); // Die rote Nachricht
//       return;
//     }

//     // Setzen des Helden (stellt sicher, dass das Ziel existiert)
//     if (!db.squads[currentSquad].slots) {
//       db.squads[currentSquad].slots = [null, null, null, null, null];
//     }

//     db.squads[currentSquad].slots[slotIdx] = hero;
//     saveAndRefresh();
//   }
// }

// Damit die Karte nach dem Loslassen wieder normal aussieht
document.addEventListener("dragend", (e) => {
  if (e.target.classList && e.target.classList.contains("hero-storage-card")) {
    e.target.style.opacity = "1";
  }
});

/**
 * STATUS-UPDATE: Wird aufgerufen, wenn Helden bewegt werden
 */
function updateHeroStatus() {
  HERO_DATA.forEach((hero) => {
    const card = document.getElementById(`card-${hero.id}`);
    if (!card) return;

    const isUsed = isHeroUsedAnywhere(hero.id);

    if (isUsed) {
      card.classList.add("in-squad");
      card.setAttribute("draggable", "false");
    } else {
      card.classList.remove("in-squad");
      card.setAttribute("draggable", "true");
    }
  });
}

/**
 * DRAG & DROP
 */
function handleDragOver(ev) {
  ev.preventDefault();
  ev.currentTarget.classList.add("drag-over");
}
function handleDragLeave(ev) {
  ev.currentTarget.classList.remove("drag-over");
}

/**
 * BERECHNUNG
 */
function calculateDR() {
  const sf = parseFloat(document.getElementById("base-sf").value) || 0;
  const drone = parseFloat(document.getElementById("base-drone").value) || 0;
  const extra = parseFloat(document.getElementById("base-extra").value) || 0;

  const totalBaseDR = (sf + drone + extra) / 100;

  // 1. Initialisiere DR für jeden Slot
  let heroStats = [0, 1, 2, 3, 4].map(() => ({
    phys: totalBaseDR,
    ener: totalBaseDR,
  }));

  const squad = db.squads[currentSquad].slots;

  if (!window.currentHeroStats) window.currentHeroStats = {};

  for (let i = 0; i < 5; i++) {
    const data = squad[i];
    if (!data) continue;

    const sourceHero = HERO_DATA.find((h) => h.id === data.id);

    ["tactics", "passive"].forEach((sType) => {
      const skill = sourceHero.skills[sType];
      if (!skill) return;

      // Berechnung des Skill-Werts basierend auf Level
      let pVal = (skill.phys_base || 0) + (data.skills[sType] - 1) * (skill.phys_inc || 0);
      let eVal = (skill.ener_base || 0) + (data.skills[sType] - 1) * (skill.ener_inc || 0);

      // Adam Special (verdoppelt seine eigene Passive)
      if (skill.special === "double_passive") {
        const pSkill = sourceHero.skills.passive;
        pVal = (pSkill.phys_base || 0) + (data.skills.passive - 1) * (pSkill.phys_inc || 0);
        eVal = (pSkill.ener_base || 0) + (data.skills.passive - 1) * (pSkill.ener_inc || 0);
      }

      // Buffs auf die Ziele verteilen
      for (let targetIdx = 0; targetIdx < 5; targetIdx++) {
        const targetData = squad[targetIdx];
        if (!targetData) continue;

        const targetHero = HERO_DATA.find((h) => h.id === targetData.id);
        const isFront = targetIdx === 0 || targetIdx === 1;

        let applies = false;
        if (skill.target === "all") applies = true;
        if (skill.target === "self" && i === targetIdx) applies = true;
        if (skill.target === "front" && isFront) applies = true;
        if (skill.target === "back" && !isFront) applies = true;
        if (skill.target === "same_type" && targetHero.cat === sourceHero.cat) applies = true;

        if (applies) {
          heroStats[targetIdx].phys += pVal;
          heroStats[targetIdx].ener += eVal;
        }
      }
    });
  }

  // 3. Speichere die Ergebnisse global, damit refreshSquadGrid darauf zugreifen kann
  window.currentHeroStats = heroStats;
  refreshSquadGrid();
  updateSquadButtons();
}

/**
 * UI REFRESH: GRID
 */
function refreshSquadGrid() {
  const squad = db.squads[currentSquad];
  if (!squad) return;
  const slotList = Array.isArray(squad.slots) ? squad.slots : Object.values(squad.slots);

  for (let i = 0; i < 5; i++) {
    const slotEl = document.getElementById(`slot-${i}`);
    if (!slotEl) continue;

    const data = slotList[i];
    let phys = 0;
    let ener = 0;

    if (data) {
      const hero = HERO_DATA.find((h) => h.id === data.id);
      if (!hero) continue;

      const maxSkill = (data.ex_lvl || 0) >= 30 ? 40 : 30;
      const stats = window.currentHeroStats && window.currentHeroStats[i] ? window.currentHeroStats[i] : { phys: 0, ener: 0 };
      window.currentHeroStats[i] = { phys, ener };
      updateDisplay(`slot-${i}`, window.currentHeroStats[i]);

      const physVal = stats.phys * 100;
      const enerVal = stats.ener * 100;

      // Dynamische Klassen für die Farben
      const physColor = physVal >= 75 ? "text-green-400 font-black" : "text-white";
      const enerColor = enerVal >= 75 ? "text-green-400 font-black" : "text-white";

      slotEl.innerHTML = `
      
                <div class="hero-slot-card group">
                    <img src="img/${hero.id}.png" onerror="handleImageError(this)" class="hero-slot-bg opacity-20">
                    
                    <div class="flex justify-between items-start relative z-10 mb-3">
                        <div class="flex items-center gap-3">
                            <div class="w-12 h-12 rounded-xl border-2 border-blue-500 overflow-hidden shadow-lg bg-gray-800">
                                <img src="img/${hero.id}.png" onerror="handleImageError(this)" class="w-full h-full object-cover">
                            </div>
                            <div class="flex flex-col">
                                <span class="text-xs font-black text-white uppercase tracking-tighter">${hero.name}</span>
                                <span class="text-[8px] font-bold text-blue-400 opacity-80 uppercase">${hero.cat}</span>
                            </div>
                        </div>
                        
                         <div id="stats-container-${i}" class="flex flex-col relative z-10 bg-gray-950/80 rounded-xl border border-white/5 overflow-hidden shadow-inner">
    
                            <div id="row-phys-${i}" 
                                class="flex justify-between items-center px-3 py-2 hover:bg-white/5 transition-colors group/row"
                                title="Reduction Cap: 75%. Overstacking helps against debuffs!">
                                <div class="flex items-center gap-2">
                                    <div class="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_5px_rgba(249,115,22,0.5)]"></div>
                                    <span class="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Phys DR</span>
                                </div>
                                <span id="slot-${i}-phys" class="font-mono ${physColor} text-sm transition-all duration-300">
                                    ${physVal.toFixed(1)}%
                                </span>
                            </div>

                            <div id="row-ener-${i}" 
                                class="flex justify-between items-center px-3 py-2 border-t border-gray-800 hover:bg-white/5 transition-colors group/row"
                                title="Reduction Cap: 75%. Overstacking helps against debuffs!">
                                <div class="flex items-center gap-2">
                                    <div class="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.5)]"></div>
                                    <span class="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Ener DR</span>
                                </div>
                                <span id="slot-${i}-ener" class="font-mono ${enerColor} text-sm transition-all duration-300">
                                    ${enerVal.toFixed(1)}%
                                </span>
                            </div>
                        </div>

                        <button onclick="removeFromSquad(${i})" class="text-gray-500 hover:text-red-500 transition-colors text-xl font-bold">×</button>
                    </div>

                    <div class="relative z-10 flex items-center justify-between bg-yellow-900/20 p-2 rounded-xl mb-2 border border-yellow-600/30">
                        <span class="text-[10px] text-yellow-500 font-black uppercase">Exclusive Weapon</span>
                        <input type="number" value="${data.ex_lvl || 0}" min="0" max="30" 
                               oninput="updateExLvl(${i}, this.value)" 
                               class="input-field-small !w-10 !h-6 !text-xs">
                    </div>

                    <div class="relative z-10 flex flex-col gap-1 mb-1">
                        ${["tactics", "passive"]
                          .map((type) => {
                            // Variablen-Scope FIX: Alles was 'type' nutzt, muss hier drin sein
                            const s = hero.skills && hero.skills[type] ? hero.skills[type] : { name: "Skill", phys_base: 0, ener_base: 0 };
                            const currentSkillLvl = data.skills && data.skills[type] ? (typeof data.skills[type] === "object" ? 1 : data.skills[type]) : 1;
                            const hasDR = s && (s.phys_base > 0 || s.ener_base > 0 || s.special);

                            return `
                                <div class="flex items-center justify-between p-2 rounded-lg bg-gray-950/50 border ${hasDR ? "border-blue-500/30" : "border-gray-800 opacity-40"}">
                                    <div class="flex flex-col">
                                        <span class="text-[10px] text-gray-100 font-bold truncate w-24">${s.name || "Skill"}</span>
                                        <span class="text-[9px] text-gray-300 uppercase">${type}</span>
                                    </div>
                                    <input type="number" value="${currentSkillLvl}" min="1" max="${maxSkill}" 
                                           oninput="updateSkillLvl(${i}, '${type}', this.value)" 
                                           class="input-field-small !w-10 !h-6 !text-xs !text-blue-400">
                                </div>
                            `;
                          })
                          .join("")}
                    </div>
  
                </div>
                
            `;
    } else {
      slotEl.innerHTML = `
        <div class="h-full w-full rounded-[2.5rem] border-4 border-dashed border-gray-800/50 flex flex-col items-center justify-center opacity-30 hover:opacity-50 transition-all bg-gray-900/20">
                    <span class="text-7xl mb-6">🐢</span>
                    <span class="text-lg text-gray-500 font-black uppercase tracking-[0.3em]">Empty Slot</span>
        </div>
            `;
    }
  }
}

function removeFromSquad(slotIdx) {
  // 1. Zugriff auf das aktuelle Squad
  const squad = db.squads[currentSquad];

  if (squad && squad.slots) {
    // 2. Den Slot leeren
    squad.slots[slotIdx] = null;

    // 3. Speichern im LocalStorage und UI aktualisieren
    saveAndRefresh();

    console.log(`Slot ${slotIdx} wurde geleert.`);
  }
}

/**
 * UPDATER
 */
function updateExLvl(slotId, val) {
  const v = Math.min(30, Math.max(1, parseInt(val) || 1));
  db.squads[currentSquad].slots[slotId].ex_lvl = v;

  // Skill Level automatisch korrigieren falls Weapon Level sinkt
  const maxSkill = v >= 30 ? 40 : 30;
  const skills = db.squads[currentSquad].slots[slotId].skills;
  if (skills.tactics > maxSkill) skills.tactics = maxSkill;
  if (skills.passive > maxSkill) skills.passive = maxSkill;

  saveAndRefresh();
}

function updateSkillLvl(slotIdx, type, newValue) {
  const val = parseInt(newValue) || 1;
  const squad = db.squads[currentSquad];

  // Sicherstellen, dass die Struktur existiert
  if (!squad.slots[slotIdx].skills) {
    squad.slots[slotIdx].skills = {};
  }

  // NUR die Zahl speichern, kein Objekt!
  squad.slots[slotIdx].skills[type] = val;

  saveAndRefresh();
}

/**
 * HELPERS
 */
function isHeroUsedAnywhere(id) {
  for (let s in db.squads) {
    for (let slot in db.squads[s].slots) {
      if (db.squads[s].slots[slot].id === id) return true;
    }
  }
  return false;
}

function removeFromSlot(slotId) {
  delete db.squads[currentSquad].slots[slotId];
  saveAndRefresh();
}
function updateBaseDR() {
  db.global = document.getElementById("input-base-dr").value;
  saveAndRefresh();
}

function switchSquad(n) {
  currentSquad = n;
  for (let i = 1; i <= 3; i++) {
    document.getElementById(`btn-squad-${i}`).classList.toggle("bg-blue-600", i === n);
    document.getElementById(`btn-squad-${i}`).classList.toggle("text-white", i === n);
  }
  saveAndRefresh();
}

function saveAndRefresh() {
  localStorage.setItem("dr_analyst_v4_db", JSON.stringify(db));
  refreshSquadGrid(); // UI bauen
  calculateDR(); // Mathe machen
  updateMetaStatus(); // Meta prüfen & Glanz aktivieren
  updateSquadButtons(); // Namen oben aktualisieren
}

function showToast(message, type = "error") {
  const toast = document.getElementById("notification-toast");
  if (!toast) return;

  // Nachricht setzen
  toast.innerText = message;

  // Farbe basierend auf Typ anpassen (optional)
  if (type === "success") {
    toast.classList.replace("bg-red-600", "bg-green-600");
    toast.style.boxShadow = "0 0 30px rgba(22, 163, 74, 0.5)";
  } else {
    toast.classList.replace("bg-green-600", "bg-red-600");
    toast.style.boxShadow = "0 0 30px rgba(220, 38, 38, 0.5)";
  }

  toast.classList.add("show");

  // Nach 3 Sekunden ausblenden
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

function clearFormation() {
  if (confirm("Clear this squad?")) {
    db.squads[currentSquad].slots = {};
    saveAndRefresh();
  }
}

function updateSquadButtons() {
  [1, 2, 3].forEach((id) => {
    const btn = document.getElementById(`btn-squad-${id}`);
    if (btn) {
      btn.innerText = getSquadName(id);

      // Aktiven Status optisch beibehalten
      if (id === currentSquad) {
        btn.classList.add("bg-blue-600", "text-white");
        btn.classList.remove("text-gray-400");
      } else {
        btn.classList.remove("bg-blue-600", "text-white");
        btn.classList.add("text-gray-400");
      }
    }
  });
}

/**
 * FILTER & SUCHE LOGIK
 */
let currentCategoryFilter = "All";

function setFilter(type) {
  currentFilter = type;

  // UI Update für Buttons
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.classList.remove("active", "bg-blue-600", "text-white");
    if (btn.innerText.includes(type) || (type === "All" && btn.innerText === "ALL")) {
      btn.classList.add("active", "bg-blue-600", "text-white");
    }
  });

  filterHeroes();
}

function filterHeroes() {
  searchQuery = document.getElementById("hero-search").value.toLowerCase();

  // Wir rufen renderHeroStorage auf, aber dieses Mal muss die Funktion filtern
  renderHeroStorage(window.lastNerziState || false);
}

function getSquadName(squadId) {
  const squad = db.squads[squadId];
  if (!squad || !squad.slots) return `S${squadId}`;

  const slots = squad.slots;
  const counts = { Tank: 0, Aircraft: 0, Missile: 0 };
  let total = 0;

  // Zähle die Typen im Squad
  Object.values(slots).forEach((slot) => {
    // FIX: Prüfe zuerst, ob der Slot NICHT null ist und eine ID hat
    if (slot && slot.id) {
      const hero = HERO_DATA.find((h) => h.id === slot.id);
      if (hero) {
        counts[hero.cat]++;
        total++;
      }
    }
  });

  const prefix = `S${squadId}`;
  if (total === 0) return prefix; // Standard S1, S2... wenn leer

  // Finde den Typen mit den meisten Helden
  let dominantType = Object.keys(counts).reduce((a, b) => (counts[a] >= counts[b] ? a : b));

  // Nur anzeigen, wenn Helden vorhanden sind
  if (counts[dominantType] === 0) return prefix;

  // Mapping für schönere Namen
  const typeNames = {
    Tank: "Tank",
    Aircraft: "Aircraft",
    Missile: "Missile",
  };

  const finalName = `${prefix}: ${typeNames[dominantType] || dominantType}`;
  return finalName;
}
function updateDisplay(row, values) {
  const pEl = document.getElementById(`${row}-phys`);
  const eEl = document.getElementById(`${row}-ener`);

  if (!pEl || !eEl) {
    console.warn(`Elemente für ${row} nicht im HTML gefunden. Abbruch.`);
    return;
  }

  // Wir rechnen mit den echten Werten ohne Cap
  const pVal = values.phys * 100;
  const eVal = values.ener * 100;

  pEl.innerHTML = formatDRString(pVal, "P");
  eEl.innerHTML = formatDRString(eVal, "E");
}

function formatDRString(value, prefix) {
  let icon = "";
  let colorClass = "text-gray-400";

  if (value >= 75) {
    // Erreicht oder überschritten
    icon = ' <span class="text-green-500">✅</span>';
    colorClass = "text-white font-black";

    if (value > 75.1) {
      icon += ' <span class="cursor-help" title="Overstacking: Gut gegen Debuffs oder falls ein Tank stirbt!">💡</span>';
      colorClass = "text-blue-400 font-black";
    }
  }

  return `<span class="${colorClass}">${prefix}: ${value.toFixed(2)}%</span>${icon}`;
}

function updateMetaStatus() {
  const squad = db.squads[currentSquad];
  if (!squad || !squad.slots) return;

  // SICHERHEITS-CHECK: Falls slots ein Objekt ist, wandle es in ein Array um
  const slotsArray = Array.isArray(squad.slots) ? squad.slots : Object.values(squad.slots);

  const activeHeroes = slotsArray // <--- Hier jetzt das gesicherte Array nutzen
    .map((s, idx) => {
      if (!s) return null;
      const h = HERO_DATA.find((hero) => hero.id === s.id);
      if (!h) return null; // Falls Held nicht gefunden wird
      return { ...h, ex_lvl: s.ex_lvl || 0, slotIdx: idx };
    })
    .filter((h) => h !== null);

  const names = activeHeroes.map((h) => h.name);
  const cats = activeHeroes.map((h) => h.cat);

  let showNerzi = false;
  let metaType = ""; // Speichert, welches Meta-Set aktiv ist

  // --- 1. AIRCRAFT 4+1 (Nerzi Easter Egg) ---
  const hasAirBase = names.includes("Lucius") && names.includes("DVA") && names.includes("Shuyler");
  const hasAirFlex = names.includes("Sarah") || names.includes("Morrison");

  console.log("Has base heroes:", hasAirBase);
  console.log("Has flex heroes", hasAirFlex);
  console.log("Has murphy:", names.includes("Murphy"));
  if (hasAirBase && hasAirFlex && names.includes("Murphy")) {
    renderHeroStorage(true); // Nerzi wird erzwungen
    metaType = "air41";
    showNerzi = true;
  } else {
    renderHeroStorage(false); // Nerzi bleibt versteckt
  }

  // --- 2. TANK 4+1 (Adam EW1 Check) ---
  const isTank41 = ["Scarlett", "Kim", "Murphy", "Adam", "Marshall"].every((n) => names.includes(n));
  if (isTank41) {
    const adam = activeHeroes.find((h) => h.name === "Adam");
    if (adam && adam.ex_lvl >= 1) {
      metaType = "tank41";
    }
  }

  // --- 3. MISSILE 4+1 (Lucius EW10 Check) ---
  const isMissile41 = ["Lucius", "Swift", "Tesla", "McGregor", "Adam"].every((n) => names.includes(n));
  if (isMissile41) {
    const lucius = activeHeroes.find((h) => h.name === "Lucius");
    if (lucius && lucius.ex_lvl >= 10) {
      metaType = "missile41";
    }
  }

  // --- 4. FULL SETS (5 of same type) ---
  if (!metaType) {
    if (cats.filter((c) => c === "Tank").length === 5) {
      if (!names.includes("Scarlett")) {
        metaType = "fullTank";
      }
    }
    if (cats.filter((c) => c === "Missile").length === 5) metaType = "fullMissile";
  }

  // Visualisierung anwenden
  applyMetaVisuals(metaType);

  // Nerzi in der Auswahl rechts steuern
  if (window.lastNerziState !== showNerzi) {
    window.lastNerziState = showNerzi;
    renderHeroStorage(showNerzi);
  }
}

function applyMetaVisuals(metaType) {
  if (metaType) {
    showToast(`You have chosen a META build! These are strong`, "success");
  }

  const slots = document.querySelectorAll(".hero-slot-card");
  slots.forEach((card) => {
    if (metaType) {
      // Wenn eine Meta (z.B. air41, tank41, fullTank) erkannt wurde
      card.classList.add("meta-active");
      // Optional: Zeige einen kleinen "Meta-Badge" Text
      console.log("Meta erkannt: " + metaType);
    } else {
      card.classList.remove("meta-active");
    }
  });
}

function handleImageError(img) {
  img.onerror = null; // Verhindert Endlosschleife, falls placeholder auch fehlt
  img.src = "img/placeholder.jpg"; // Stelle sicher, dass die Datei existiert!
}

function resetFullDatabase() {
  if (confirm("Möchtest du wirklich alle gespeicherten Squads und Einstellungen löschen?")) {
    // Löscht nur die spezifischen Keys deiner App
    localStorage.removeItem("dr_analyst_v4_db");
    localStorage.removeItem("dr_analyst_custom_heroes");

    // Lädt die Seite neu, um den sauberen Zustand aus init() zu triggern
    location.reload();
  }
}

window.onload = init;
