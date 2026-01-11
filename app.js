/**
 * DR ANALYST - PRO ENGINE (app.js)
 * Features: Exclusive Weapon scaling, 3-Skill Logic, Drag & Drop
 */

let HERO_DATA = [];
let currentSquad = 1;

let db = {
    global: 44.0,
    squads: {
        1: { slots: {} },
        2: { slots: {} },
        3: { slots: {} }
    }
};

/**
 * INITIALISIERUNG
 */
async function init() {
    try {
        const response = await fetch('heroes.json');
        if (!response.ok) throw new Error('Heroes JSON missing');
        HERO_DATA = await response.json();
        HERO_DATA.sort((a, b) => a.name.localeCompare(b.name));

        const saved = localStorage.getItem('dr_analyst_v4_db');
        if (saved) db = JSON.parse(saved);

        document.getElementById('input-base-dr').value = db.global;
        renderHeroStorage();
        switchSquad(1);

    } catch (error) {
        console.error("Init Error:", error);
    }
}

/**
 * RENDERER: LINKES LAGER
 */
function renderHeroStorage() {
    const storage = document.getElementById('hero-storage');
    storage.innerHTML = "";

    HERO_DATA.forEach((hero, index) => {
        const isUsed = isHeroUsedAnywhere(hero.id);
        const card = document.createElement('div');
        card.className = `hero-card bg-gray-800 p-3 rounded-xl border border-gray-700 shadow-sm transition-all ${isUsed ? 'in-squad' : 'hover:border-blue-500 cursor-grab'}`;
        card.setAttribute('draggable', !isUsed);
        
        card.ondragstart = (e) => {
            e.dataTransfer.setData("heroId", hero.id);
        };

        card.innerHTML = `
            <div class="flex justify-between items-center">
                <span class="text-xs font-black uppercase italic">${hero.name}</span>
                <span class="text-[8px] bg-gray-900 px-1.5 py-0.5 rounded text-gray-500">${hero.cat}</span>
            </div>
        `;
        storage.appendChild(card);
    });
}

/**
 * DRAG & DROP
 */
function handleDragOver(ev) { ev.preventDefault(); ev.currentTarget.classList.add('drag-over'); }
function handleDragLeave(ev) { ev.currentTarget.classList.remove('drag-over'); }

function handleDrop(ev) {
    ev.preventDefault();
    ev.currentTarget.classList.remove('drag-over');
    const heroId = ev.dataTransfer.getData("heroId");
    const slotId = ev.currentTarget.id.replace('slot-', '');
    
    const hero = HERO_DATA.find(h => h.id === heroId);
    if (hero) assignHeroToSlot(hero, slotId);
}

function assignHeroToSlot(hero, slotId) {
    if (isHeroUsedAnywhere(hero.id)) { showToast(); return; }

    db.squads[currentSquad].slots[slotId] = {
        id: hero.id,
        name: hero.name,
        ex_lvl: 1,
        skills: {
            tactics: 1,
            passive: 1
        }
    };
    saveAndRefresh();
}

/**
 * BERECHNUNG
 */
function calculateDR() {
const base = parseFloat(db.global) || 0;
    let frontTotal = base;
    let backTotal = base;

    const slots = db.squads[currentSquad].slots;

    // Durchlaufe alle belegten Slots
    Object.keys(slots).forEach(slotKey => {
        const slotData = slots[slotKey];
        const hero = HERO_DATA.find(h => h.id === slotData.id);
        if (!hero) return;

        // Gehe die Skill-Typen durch
        ['tactics', 'passive'].forEach(type => {
            const skillConf = hero.skills[type];
            
            // WICHTIG: Prüfen ob Skill existiert und DR-Werte hat
            if (skillConf && skillConf.hasDR && typeof skillConf.base !== 'undefined') {
                const lvl = slotData.skills[type] || 1; 
                const val = skillConf.base + (lvl * skillConf.inc);
                
                if (skillConf.target === 'team') { 
                    frontTotal += val; 
                    backTotal += val; 
                } else if (skillConf.target === 'front') { 
                    frontTotal += val; 
                } else if (skillConf.target === 'self') {
                    // Slot 0,1 = Front | Slot 2,3,4 = Back
                    (parseInt(slotKey) < 2) ? frontTotal += (val / 2) : backTotal += (val / 3);
                }
            }
        });
    }); 

   // UI Update
    const fDisplay = document.getElementById('display-front-dr');
    const bDisplay = document.getElementById('display-back-dr');

    if (fDisplay) fDisplay.innerText = frontTotal.toFixed(2) + "%";
    if (bDisplay) bDisplay.innerText = backTotal.toFixed(2) + "%";
    
    // Optisches Feedback bei Cap-Erreichung (75%)
    if(fDisplay) fDisplay.classList.toggle('text-red-500', frontTotal >= 75);
    if(bDisplay) bDisplay.classList.toggle('text-red-500', backTotal >= 75);
}

/**
 * UI REFRESH: GRID
 */
function refreshSquadGrid() {
    for (let i = 0; i < 5; i++) {
        const slotEl = document.getElementById(`slot-${i}`);
        const data = db.squads[currentSquad].slots[i];

        if (data) {
            const hero = HERO_DATA.find(h => h.id === data.id);
            const maxSkill = data.ex_lvl >= 30 ? 40 : 30;
            
            slotEl.innerHTML = `
                <div class="flex flex-col w-full h-full p-2 bg-gray-900 border border-blue-500/40 rounded-2xl overflow-hidden relative group">
                    <div class="flex justify-between items-center mb-1">
                        <span class="text-[9px] font-black text-blue-400 truncate w-20 uppercase">${hero.name}</span>
                        <button onclick="removeFromSlot(${i})" class="text-red-500 font-bold hover:scale-125 transition-transform">×</button>
                    </div>

                    <div class="flex items-center justify-between bg-gray-800 p-1 rounded mb-1 border border-yellow-600/30">
                        <span class="text-[7px] text-yellow-500 font-bold">EX WEAPON</span>
                        <input type="number" value="${data.ex_lvl}" min="1" max="30" 
                               oninput="updateExLvl(${i}, this.value)" class="bg-transparent text-white text-right w-6 font-mono text-[9px]">
                    </div>

                    <div class="grid grid-cols-2 gap-1 text-[7px]">
                        <div class="bg-gray-800/50 p-1 rounded opacity-40">
                            <span class="block truncate">${hero.skills.auto.name}</span>
                            <span>Auto (N/A)</span>
                        </div>
                        <div class="p-1 rounded bg-gray-800 ${hero.skills.tactics.hasDR ? 'border border-blue-500/50' : ''}">
                            <span class="block truncate text-white">${hero.skills.tactics.name}</span>
                            <input type="number" value="${data.skills.tactics}" min="1" max="${maxSkill}" 
                                   oninput="updateSkillLvl(${i}, 'tactics', this.value)" class="bg-transparent text-blue-400 w-full text-right font-mono">
                        </div>
                        <div class="p-1 rounded bg-gray-800 ${hero.skills.passive.hasDR ? 'border border-blue-500/50' : ''}">
                            <span class="block truncate text-white">${hero.skills.passive.name}</span>
                            <input type="number" value="${data.skills.passive}" min="1" max="${maxSkill}" 
                                   oninput="updateSkillLvl(${i}, 'passive', this.value)" class="bg-transparent text-blue-400 w-full text-right font-mono">
                        </div>
                    </div>
                </div>
            `;
        } else {
            slotEl.innerHTML = `<span class="text-[9px] text-gray-800 font-black">SLOT ${i+1}</span>`;
        }
    }
    renderHeroStorage();
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
    if(skills.tactics > maxSkill) skills.tactics = maxSkill;
    if(skills.passive > maxSkill) skills.passive = maxSkill;
    
    saveAndRefresh();
}

function updateSkillLvl(slotId, type, val) {
    const data = db.squads[currentSquad].slots[slotId];
    const max = data.ex_lvl >= 30 ? 40 : 30;
    data.skills[type] = Math.min(max, Math.max(1, parseInt(val) || 1));
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

function removeFromSlot(slotId) { delete db.squads[currentSquad].slots[slotId]; saveAndRefresh(); }
function updateBaseDR() { db.global = document.getElementById('input-base-dr').value; saveAndRefresh(); }

function switchSquad(n) {
    currentSquad = n;
    for (let i = 1; i <= 3; i++) {
        document.getElementById(`btn-squad-${i}`).classList.toggle('bg-blue-600', i === n);
        document.getElementById(`btn-squad-${i}`).classList.toggle('text-white', i === n);
    }
    saveAndRefresh();
}

function saveAndRefresh() {
    localStorage.setItem('dr_analyst_v4_db', JSON.stringify(db));
    refreshSquadGrid();
    calculateDR();
}

function showToast() {
    const toast = document.getElementById('notification-toast');
    toast.style.transform = "translateY(0)";
    setTimeout(() => toast.style.transform = "translateY(5rem)", 3000);
}

function clearFormation() {
    if (confirm("Clear this squad?")) { db.squads[currentSquad].slots = {}; saveAndRefresh(); }
}


/**
 * CSV PROZESSOR
 * Erwartet Spalten: id;name;cat;skill_name;skill_type;base;inc;target
 * Beispiel: murphy;Murphy;Tank;Iron Shield;tactics;14;0.1;front
 */
function processCSV() {
    const input = document.getElementById('csv-input').value.trim();
    if (!input) return alert("Please paste CSV data first!");

    const lines = input.split('\n');
    let updateCount = 0;

    lines.forEach(line => {
        // Trennung per Semikolon oder Tab (für Copy-Paste aus Sheets)
        const cols = line.includes('\t') ? line.split('\t') : line.split(';');
        
        if (cols.length >= 8) {
            const [id, name, cat, sName, sType, sBase, sInc, sTarget] = cols.map(c => c.trim());
            
            // Helden in der Datenbank finden oder neu anlegen
            let hero = HERO_DATA.find(h => h.id === id);
            
            if (!hero) {
                hero = {
                    id: id,
                    name: name,
                    cat: cat,
                    skills: {
                        auto: { name: "Standard", hasDR: false },
                        tactics: { name: "Tactics", hasDR: false },
                        passive: { name: "Passive", hasDR: false }
                    }
                };
                HERO_DATA.push(hero);
            }

            // Skill-Werte aktualisieren (sType ist 'tactics' oder 'passive')
            if (hero.skills[sType]) {
                hero.skills[sType] = {
                    name: sName,
                    hasDR: true,
                    base: parseFloat(sBase.replace(',', '.')),
                    inc: parseFloat(sInc.replace(',', '.')),
                    target: sTarget
                };
                updateCount++;
            }
        }
    });

    // Nach dem Import: UI aktualisieren und im LocalStorage als "Custom Data" speichern
    HERO_DATA.sort((a, b) => a.name.localeCompare(b.name));
    localStorage.setItem('dr_analyst_custom_heroes', JSON.stringify(HERO_DATA));
    
    renderHeroStorage();
    calculateDR();
    alert(`Import finished! Updated ${updateCount} skills.`);
}

// Damit die importierten Daten beim Laden nicht verloren gehen, 
// muss die init() Funktion angepasst werden:
async function init() {
    // 1. Zuerst schauen, ob wir eigene Daten im LocalStorage haben
    const customHeroes = localStorage.getItem('dr_analyst_custom_heroes');
    
    if (customHeroes) {
        HERO_DATA = JSON.parse(customHeroes);
    } else {
        // Sonst Standard-JSON laden
        const response = await fetch('heroes.json');
        HERO_DATA = await response.json();
    }
    
    // ... restliche Init-Logik (db laden, switchSquad etc.)
}

function downloadCurrentJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(HERO_DATA, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "heroes_updated.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

window.onload = init;