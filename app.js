let HERO_DATA = [];
let currentSquad = 1;
let currentFilter = "All";
let searchQuery = "";
window.currentHeroStats = {};
let currentTargetSlot = null;

const createEmptySlot = () => ({
  id: null,
  ex_lvl: 0,
  stars: 0,
  skills: {
    tactics: 1,
    passive: 1,
  },
});

let db = {
  global: 0.0,
  specialForces: 0.0,
  drone: 0.0,
  currentSquadIdx: 0,
  squads: [
    { name: "Squad 1", slots: Array.from({ length: 5 }, createEmptySlot) },
    { name: "Squad 2", slots: Array.from({ length: 5 }, createEmptySlot) },
    { name: "Squad 3", slots: Array.from({ length: 5 }, createEmptySlot) },
  ],
};

/**
 * INITIALISIERUNG
 */
async function init() {
  console.log("init started");
  try {
    await loadHeroData();
    loadDatabase();

    const desktopConfig = document.getElementById("desktop-config-container");
    const mobileContainer = document.getElementById("mobile-config-container");

    if (desktopConfig && mobileContainer) {
      mobileContainer.innerHTML = desktopConfig.innerHTML;

      const mobileInputs = mobileContainer.querySelectorAll("input");

      mobileInputs.forEach((mInput) => {
        const originalId = mInput.id;
        mInput.id = "mobile-" + originalId;

        mInput.addEventListener("input", (e) => {
          const dInput = document.getElementById(originalId);
          if (dInput) {
            dInput.value = e.target.value;
            saveAndRefresh();
          }
        });
      });
    }

    if (window.innerWidth >= 1024) {
      renderHeroStorage(false, false); // Nur Sidebar rendern
    } else {
      renderHeroStorage(false, true);
    }

    refreshSquadGrid();

    // Event-Listener für Fenstergrößen-Änderung
    window.addEventListener("resize", fitTacticalField);

    // Wichtig: Einmal aufrufen, wenn alles gerendert ist
    setTimeout(fitTacticalField, 100);

    console.log("Init complete");
  } catch (error) {
    console.error("Init fehlgeschlagen:", error);
    // Fallback: Falls alles crashed, leeres Array aber Code läuft weiter
    HERO_DATA = [];
  }
}

async function loadHeroData() {
  try {
    const response = await fetch("heroes.json");
    if (!response.ok) throw new Error("JSON konnte nicht geladen werden");

    HERO_DATA = await response.json();
    console.log("Helden erfolgreich geladen:", HERO_DATA.length);

    // Erst wenn die Daten da sind, rendern wir den Storage
    renderHeroStorage();
  } catch (error) {
    console.error("Fehler beim Laden der Helden-JSON:", error);
    // Fallback: Ein leerer Storage ist besser als ein Absturz
    document.getElementById("hero-storage").innerHTML = "Fehler beim Laden der Helden.";
  }
}

function loadDatabase() {
  let data = {
    global: 0.0,
    currentSquadIdx: 0, // Wir speichern den aktiven Tab direkt mit
    squads: [
      { name: "Squad 1", slots: [null, null, null, null, null] },
      { name: "Squad 2", slots: [null, null, null, null, null] },
      { name: "Squad 3", slots: [null, null, null, null, null] },
    ],
  };

  const saved = localStorage.getItem("dr_analyst_v4_db"); // Wichtig: dein Key v4
  if (!saved) {
    console.warn("No data found in local storage. Creating new db");
  }

  data = JSON.parse(saved);

  if (data.squads && !Array.isArray(data.squads)) {
    data.squads = Object.values(data.squads);
  }

  data.squads.forEach((squad) => {
    if (squad.slots && !Array.isArray(squad.slots)) {
      let newSlots = [null, null, null, null, null];
      Object.keys(squad.slots).forEach((key) => {
        const idx = parseInt(key);
        if (idx >= 0 && idx < 5) {
          newSlots[idx] = squad.slots[key];
        }
      });
      squad.slots = newSlots;
    }
  });

  db = data;
}

function openHeroModal(slotIdx) {
  currentTargetSlot = slotIdx; // Speicher den Slot-Index
  document.getElementById("hero-modal").classList.remove("hidden");
  renderHeroStorage(window.lastNerziState, true); // Render ins Modal!
}

function selectHeroFromModal(heroId) {
  if (currentTargetSlot !== null) {
    const success = assignHeroToSlot(heroId, currentTargetSlot);

    if (success) {
      closeHeroModal();
    }
  }
}

function closeHeroModal() {
  document.getElementById("hero-modal").classList.add("hidden");
  currentTargetSlot = null;
}

/**
 * RENDERER: LINKES LAGER
 */
// Wir setzen forceNerzi = false als Standardwert (Default Parameter)
// Wir fügen isModal als Parameter hinzu (Default ist false)
function renderHeroStorage(forceNerzi = false, isModal = false) {
  const container = isModal ? document.getElementById("modal-hero-list") : document.getElementById("hero-storage");
  if (!container) return;

  container.innerHTML = "";

  const activeFilter = isModal ? (typeof modalFilter !== "undefined" ? modalFilter : "All") : typeof currentFilter !== "undefined" ? currentFilter : "All";
  const activeSearch = isModal ? (typeof modalSearchQuery !== "undefined" ? modalSearchQuery : "") : typeof searchQuery !== "undefined" ? searchQuery : "";

  const filtered = HERO_DATA.filter((hero) => {
    const matchesType = activeFilter === "All" || hero.cat === activeFilter;
    const matchesSearch = (hero.name || "").toLowerCase().includes(activeSearch.toLowerCase());

    const isNerzi = hero.name === "Nerzi";
    if (isNerzi && !forceNerzi) return false;

    return matchesType && matchesSearch;
  });

  filtered.forEach((hero) => {
    const card = document.createElement("div");

    card.className = isModal ? "cursor-pointer transform active:scale-95 transition-transform" : "hero-storage-card group";

    if (!isModal) {
      card.draggable = true;
      card.ondragstart = (e) => handleDragStart(e, hero.id);
    } else {
      card.onclick = () => {
        selectHeroFromModal(hero.id);
      };
    }

    card.innerHTML = `
        <div class="relative overflow-hidden rounded-lg border border-gray-800 bg-gray-950 p-2 hover:border-blue-500 transition-all cursor-grab active:cursor-grabbing">
            <div class="w-full h-16 flex items-center justify-center mb-1">
                <img src="img/${hero.id}.png" 
                     onerror="this.src='https://emojicdn.elk.sh/🐢'; this.style.opacity='0.5'" 
                     class="max-w-full max-h-full object-contain rounded opacity-80 group-hover:opacity-100 transition-opacity">
            </div>
            <div class="text-[9px] font-black text-white uppercase truncate text-center">${hero.name}</div>
            <div class="text-[7px] text-gray-500 uppercase text-center">${hero.cat}</div>
            ${isModal ? '<div class="mt-2 text-[8px] bg-blue-600 text-center rounded py-1 font-bold text-white">SELECT</div>' : ""}
        </div>
    `;
    container.appendChild(card);
  });

  if (!isModal) {
    const countEl = document.getElementById("hero-count");
    if (countEl) countEl.innerText = filtered.length;
  }
}

function handleDragStart(e, heroId) {
  e.dataTransfer.setData("heroId", heroId);
  e.dataTransfer.effectAllowed = "copy";

  e.target.style.opacity = "0.5";
}

function handleDragOver(e) {
  // WICHTIG: Verhindert das Standardverhalten, damit "Drop" erlaubt wird
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
  e.currentTarget.classList.add("drag-over");
}

function assignHeroToSlot(heroId, slotIdx) {
  const heroBase = HERO_DATA.find((h) => h.id === heroId);
  if (!heroBase) return;

  const currentIdx = db.currentSquadIdx;
  let savedStats = null;

  const currentSlotHero = db.squads[currentIdx].slots[slotIdx];
  if (currentSlotHero && currentSlotHero.id === heroId) {
    savedStats = currentSlotHero;
    console.log("Held existiert hier schon - Werte werden behalten.");
  } else {
    for (const squad of db.squads) {
      const found = squad.slots.find((s) => s.id === heroId);
      if (found) {
        savedStats = found;
        console.log("Bekannten Helden gefunden - Werte werden übernommen.");
        break;
      }
    }
  }

  const newValues = savedStats
    ? {
        ex_lvl: savedStats.ex_lvl,
        stars: savedStats.stars || 0,
        skills: { ...savedStats.skills },
      }
    : {
        ex_lvl: 0,
        stars: 0,
        skills: { tactics: 1, passive: 1 },
      };

  db.squads[currentIdx].slots[slotIdx] = {
    id: heroBase.id,
    name: heroBase.name,
    cat: heroBase.cat,
    ...newValues,
  };

  saveAndRefresh();
}

function handleDrop(e, slotIdx) {
  e.preventDefault();
  const heroId = e.dataTransfer.getData("text/plain") || e.dataTransfer.getData("text");

  // Einfach die zentrale Funktion rufen
  assignHeroToSlot(heroId, slotIdx);

  e.currentTarget.classList.remove("drag-over");
}

// Damit die Karte nach dem Loslassen wieder normal aussieht
document.addEventListener("dragend", (e) => {
  if (e.target.classList && e.target.classList.contains("hero-storage-card")) {
    e.target.style.opacity = "1";
  }
});

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
  const baseSF = parseFloat(document.getElementById("base-sf")?.value) || 0;
  const baseDrone = parseFloat(document.getElementById("base-drone")?.value) || 0;
  const baseExtra = parseFloat(document.getElementById("base-extra")?.value) || 0;
  const globalBaseDR = baseSF + baseDrone + baseExtra;

  const currentSquadIdx = db.currentSquadIdx;
  const squadData = db.squads[currentSquadIdx];

  if (!squadData || !squadData.slots) return;

  // const allHeroIds = squadData.slots.map(s => s?.id);

  let frontlineBonus = 0;
  let backlineBonus = 0;

  // if (allHeroIds.includes("williams")) frontlineBonus += 10;
  // if (allHeroIds.includes("marshall")) backlineBonus += 3; // Beispiel

  squadData.slots.forEach((heroData, slotIdx) => {
    const drElement = document.getElementById(`dr-value-${slotIdx}`);

    if (!drElement) return;

    if (!heroData || !heroData.id) {
      drElement.innerText = "0.0%";
      drElement.className = "text-2xl font-black italic text-gray-600 leading-none"; // Reset Style
      return;
    }

    const heroBase = HERO_DATA.find((h) => h.id === heroData.id);
    if (!heroBase) return;

    let totalDR = globalBaseDR;

    if (heroBase.skills.tactics?.hasDR) {
      const lvl = heroData.skills.tactics || 1;
      const base = heroBase.skills.tactics.base || 0;
      const inc = heroBase.skills.tactics.inc || 0;
      totalDR += base + lvl * inc;
    }

    if (heroBase.skills.passive?.hasDR) {
      const lvl = heroData.skills.passive || 1;
      const base = heroBase.skills.passive.base || 0;
      const inc = heroBase.skills.passive.inc || 0;
      totalDR += base + (lvl - 1) * inc;
    }

    // Reihe (Front/Back)
    if (slotIdx === 0 || slotIdx === 1) totalDR += frontlineBonus;
    else totalDR += backlineBonus;

    drElement.innerText = totalDR.toFixed(1) + "%";

    // Klassen-Management (wir überschreiben className komplett oder nutzen classList)
    // Hier sicherstellen, dass wir die Tailwind-Basisklassen behalten
    const baseClasses = "text-2xl font-black italic leading-none drop-shadow-md transition-colors duration-300";

    if (totalDR >= 85) {
      drElement.className = `${baseClasses} text-red-500`;
    } else if (totalDR >= 70) {
      drElement.className = `${baseClasses} text-yellow-400`;
    } else {
      drElement.className = `${baseClasses} text-blue-500`;
    }
  });
}

/**
 * UI REFRESH: GRID
 */
function refreshSquadGrid() {
  if (!db || !db.squads) {
    console.error("Datenbank nicht initialisiert");
    return;
  }

  if (!db.squads[db.currentSquadIdx]) {
    console.warn("Ungültiger Squad-Index! Setze auf 0 zurück.");
    switchSquad(0);
  }

  const currentSquad = db.squads[db.currentSquadIdx];
  currentSquad.slots.forEach((hero, idx) => {
    const slot = document.getElementById(`slot-${idx}`);
    if (!slot) return;

    const placeholder = document.getElementById(`empty-slot-placeholder-${idx}`);
    const content = document.getElementById(`hero-content-${idx}`);
    const isEmpty = !hero || !hero.id;

    if (placeholder && content) {
      if (isEmpty) {
        placeholder.classList.remove("hidden");
        content.classList.add("hidden");
      } else {
        placeholder.classList.add("hidden");
        content.classList.remove("hidden");

        // Hier füllen wir die Daten in dein HTML
        document.getElementById(`hero-name-${idx}`).innerText = hero.name;

        // Falls du das Bild-Element findest:
        const mainImg = content.querySelector(".flex-1 img");
        if (mainImg) mainImg.src = `img/${hero.id}.png`;

        // Splash Art im Hintergrund
        const splashImg = content.querySelector(".hero-skew");
        if (splashImg) splashImg.src = `img/${hero.id}.png`;
      }
    }

    // slot.className = "squad-slot relative overflow-hidden aspect-[3/4] rounded-[2rem] border-2 border-blue-500 bg-black shadow-2xl";

    const pDR = 0;
    const eDR = 0;
  });

  // Abstand-Check (Desktop Fix)
  fitTacticalField();
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

function updateSkillLevel(slotIdx, type, value) {
  let val = parseInt(value);
  if (isNaN(val) || val < 1) val = 1;

  const hero = db.squads[db.currentSquadIdx].slots[slotIdx];
  if (!hero) {
    console.error("Slot nicht gefunden:", slotIdx);
    return;
  }

  if (!hero.skills) hero.skills = {};

  console.log(`Update Slot ${slotIdx}: ${type} ist jetzt Level ${val}`);

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
  db.currentSquadIdx = n;

  currentSquad = n;
  for (let i = 0; i < 3; i++) {
    const btn = document.getElementById(`squad-btn-${i}`);
    if (btn) {
      // WICHTIG: Nur ausführen, wenn der Button existiert!
      if (i === idx) {
        btn.classList.add("bg-blue-600", "text-white");
        btn.classList.remove("text-gray-500");
      } else {
        btn.classList.remove("bg-blue-600", "text-white");
        btn.classList.add("text-gray-500");
      }
    }
  }

  saveAndRefresh();
}

function saveAndRefresh() {
  calculateDR();

  localStorage.setItem("dr_analyst_v4_db", JSON.stringify(db));

  refreshSquadGrid();
  updateMetaStatus();
  updateSquadButtons();
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
  img.onerror = null;
  // img.src = "img/placeholder.jpg";
  img.src = "img/new-turtle.png";
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

let selectedHeroId = null;

// Im Hero-Storage:
function handleHeroClick(heroId) {
  if (window.innerWidth < 1024) {
    selectedHeroId = heroId;
    showToast("Held ausgewählt. Klicke jetzt auf einen Slot!", "success");
  }
}

// In der refreshSquadGrid für leere Slots:
// Füge ein onclick="handleSlotClick(${i})" hinzu
function handleSlotClick(slotIdx) {
  if (selectedHeroId) {
    // Nutze deine existierende Logik um den Helden zu platzieren
    placeHeroInSlot(selectedHeroId, slotIdx);
    selectedHeroId = null;
  }
}

let modalFilter = "All";
let modalSearchQuery = "";

function setModalFilter(type) {
  modalFilter = type;
  // Visuelles Feedback für die Buttons
  document.querySelectorAll(".modal-filter-btn").forEach((btn) => {
    const isActive = btn.innerText.includes(type.toUpperCase());
    btn.classList.toggle("border-blue-500", isActive);
    btn.classList.toggle("text-blue-400", isActive);
    btn.classList.toggle("bg-blue-500/10", isActive);
  });
  filterModalHeroes();
}

function filterModalHeroes() {
  modalSearchQuery = document.getElementById("modal-search").value.toLowerCase();

  // Wir nutzen die bestehende renderHeroStorage, übergeben aber
  // die Modal-spezifischen Filterwerte
  renderHeroStorage(window.lastNerziState, true);
}

function fitTacticalField() {
  const field = document.getElementById("tactical-field");
  const main = field.parentElement;

  if (!field || !main) return;

  // 1. Wir holen uns die berechneten Abstände (Padding) vom Main-Element
  const style = window.getComputedStyle(main);
  const paddingX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
  const paddingY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);

  // 2. Verfügbarer Platz abzüglich der "Sicherheitszone" (Padding)
  const availableW = main.clientWidth - paddingX;
  const availableH = main.clientHeight - paddingY;

  // 3. Wie groß ist das Feld unskaliert?
  // Wir nutzen die natürliche Größe (offsetWidth), setzen die Skalierung dafür kurz auf 1
  field.style.transform = "scale(1)";
  const fieldW = field.offsetWidth;
  const fieldH = field.offsetHeight;

  // 4. Skalierung berechnen (Breite oder Höhe, je nachdem was zuerst knapp wird)
  let scale = Math.min(availableW / fieldW, availableH / fieldH);

  // 5. Nicht größer als 100% skalieren (außer du willst Zoom auf 4K Monitoren)
  scale = Math.min(scale, 1);

  // 6. Auf Mobile (unter 768px) Skalierung meist ignorieren, da wir dort scrollen
  if (window.innerWidth < 768) {
    field.style.transform = "scale(1)";
  } else {
    field.style.transform = `scale(${scale})`;
    field.style.transformOrigin = "center center";
  }
}

window.onload = init;

document.addEventListener("DOMContentLoaded", () => {
  // Initialisiert deine Daten und zeichnet das Grid
  refreshSquadGrid();
  renderHeroStorage();
  if (typeof fitTacticalField === "function") fitTacticalField();
});
