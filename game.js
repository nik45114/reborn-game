// ========== DATA ==========

const CATEGORIES = {
    cpu:  { name: "Процессор",    icon: "🧠" },
    gpu:  { name: "Видеокарта",   icon: "🎮" },
    ram:  { name: "Оперативная",  icon: "💾" },
    mb:   { name: "Мат. плата",   icon: "🔲" },
    psu:  { name: "Блок питания", icon: "🔌" },
    cool: { name: "Охлаждение",   icon: "❄️" }
};

const RARITIES = {
    common:    { name: "Обычная",    chance: 0.45, color: "#9ca3af", power: [10, 30] },
    rare:      { name: "Редкая",     chance: 0.30, color: "#3b82f6", power: [31, 60] },
    epic:      { name: "Эпическая",  chance: 0.18, color: "#a855f7", power: [61, 85] },
    legendary: { name: "Легендарная", chance: 0.07, color: "#f59e0b", power: [86, 100] }
};

const COMPONENTS = {
    cpu: {
        common:    ["Intel i3-12100"],
        rare:      ["Intel i7-13700K"],
        epic:      ["Intel i9-13900K"],
        legendary: ["AMD Ryzen 9 7950X3D"]
    },
    gpu: {
        common:    ["GTX 1650"],
        rare:      ["RTX 4070 Super"],
        epic:      ["RTX 4080 Super"],
        legendary: ["RTX 4090"]
    },
    ram: {
        common:    ["DDR4 16GB 2666MHz"],
        rare:      ["DDR5 32GB 5600MHz"],
        epic:      ["DDR5 64GB 5600MHz"],
        legendary: ["DDR5 64GB 7200MHz"]
    },
    mb: {
        common:    ["ASUS Prime H610"],
        rare:      ["ASUS ROG Strix B550-F"],
        epic:      ["ASUS ROG Maximus Z790"],
        legendary: ["MSI MEG Z790 GODLIKE"]
    },
    psu: {
        common:    ["500W Be Quiet"],
        rare:      ["850W Corsair RM850x"],
        epic:      ["1000W Corsair HX1000"],
        legendary: ["1600W ROG Thor"]
    },
    cool: {
        common:    ["ID-Cooling SE-214"],
        rare:      ["Noctua NH-D15"],
        epic:      ["NZXT Kraken X73"],
        legendary: ["ROG RYUJIN III 360"]
    }
};

const BUILD_TIERS = [
    { name: "Офисный ПК",      stars: 1, minPower: 0,   bonus: 10,  emoji: "🖨" },
    { name: "Домашний ПК",     stars: 2, minPower: 150, bonus: 30,  emoji: "🏠" },
    { name: "Игровой ПК",      stars: 3, minPower: 300, bonus: 75,  emoji: "🎮" },
    { name: "Pro Gaming ПК",   stars: 4, minPower: 470, bonus: 200, emoji: "🔥" },
    { name: "Ultimate ПК",     stars: 5, minPower: 600, bonus: 500, emoji: "👑" }
];

// TESTING MODE — unlimited for all (remove later)
let MAX_TICKETS = 99999;
let TICKET_REGEN_MS = 1000;
let IS_ADMIN = true;

// ========== STATE ==========

let state = loadState();

function defaultState() {
    return {
        tickets: MAX_TICKETS,
        lastTicketTime: Date.now(),
        bonusPoints: 0,
        inventory: [],
        currentBuild: { cpu: null, gpu: null, ram: null, mb: null, psu: null, cool: null },
        buildsHistory: [],
        lastLoginDate: null,
        loginStreak: 0
    };
}

function loadState() {
    try {
        const s = localStorage.getItem("reborn_pc_game_v2");
        if (s) {
            const loaded = JSON.parse(s);
            const def = defaultState();
            // Backfill missing top-level keys from defaults (for saves from older versions)
            for (const k of Object.keys(def)) {
                if (loaded[k] === undefined) loaded[k] = def[k];
            }
            // Backfill missing build slots (e.g. 'mb' added later)
            for (const slot of Object.keys(def.currentBuild)) {
                if (!(slot in loaded.currentBuild)) loaded.currentBuild[slot] = null;
            }
            return loaded;
        }
    } catch(e) {}
    return defaultState();
}

function saveState() {
    localStorage.setItem("reborn_pc_game_v2", JSON.stringify(state));
}

// ========== TICKETS ==========

function regenTickets() {
    if (state.tickets >= MAX_TICKETS) {
        state.lastTicketTime = Date.now();
        return;
    }
    const elapsed = Date.now() - state.lastTicketTime;
    const newT = Math.floor(elapsed / TICKET_REGEN_MS);
    if (newT > 0) {
        state.tickets = Math.min(MAX_TICKETS, state.tickets + newT);
        state.lastTicketTime = Date.now();
        saveState();
    }
}

function updateTicketTimer() {
    regenTickets();
    document.getElementById("tickets").textContent = state.tickets;
    const el = document.getElementById("ticket-timer");
    const dropSub = document.getElementById("drop-sub");
    const dropBtn = document.getElementById("btn-drop");

    dropSub.textContent = `🎫 ${state.tickets} попыт${state.tickets === 1 ? "ка" : "ки"}`;
    dropBtn.disabled = state.tickets <= 0;

    if (state.tickets >= MAX_TICKETS) {
        el.textContent = "Все попытки доступны!";
    } else {
        const elapsed = Date.now() - state.lastTicketTime;
        const remaining = TICKET_REGEN_MS - elapsed;
        const hrs = Math.floor(remaining / 3600000);
        const min = Math.floor((remaining % 3600000) / 60000);
        const sec = Math.floor((remaining % 60000) / 1000);
        el.textContent = `Следующая попытка через ${hrs}ч ${min.toString().padStart(2,"0")}м ${sec.toString().padStart(2,"0")}с`;
    }
}

// ========== DROP ==========

function rollRarity() {
    const r = Math.random();
    let c = 0;
    for (const [key, rar] of Object.entries(RARITIES)) {
        c += rar.chance;
        if (r <= c) return key;
    }
    return "common";
}

function rollComponent() {
    const rarity = rollRarity();
    const catKeys = Object.keys(CATEGORIES);
    const category = catKeys[Math.floor(Math.random() * catKeys.length)];
    const models = COMPONENTS[category][rarity];
    const model = models[Math.floor(Math.random() * models.length)];
    const [minP, maxP] = RARITIES[rarity].power;
    const power = minP + Math.floor(Math.random() * (maxP - minP + 1));
    return { id: Date.now() + Math.random(), category, rarity, model, power };
}

function doDrop() {
    if (IS_ADMIN) state.tickets = 99999;
    regenTickets();
    if (state.tickets <= 0) return null;
    state.tickets--;
    if (state.tickets === MAX_TICKETS - 1) state.lastTicketTime = Date.now();
    const comp = rollComponent();
    saveState();
    return comp;
}

// ========== BUILD ==========

function getBuildPower() {
    let t = 0;
    for (const s of Object.values(state.currentBuild)) if (s) t += s.power;
    return t;
}

function getBuildTier(power) {
    // Ultimate only if ALL 6 components are legendary
    const allLegendary = isBuildComplete() &&
        Object.values(state.currentBuild).every(c => c && c.rarity === "legendary");
    if (allLegendary) return BUILD_TIERS[BUILD_TIERS.length - 1];

    let tier = BUILD_TIERS[0];
    for (const t of BUILD_TIERS) {
        if (t.name === "Ultimate ПК") continue; // skip, only via all legendary
        if (power >= t.minPower) tier = t;
    }
    return tier;
}

function isBuildComplete() {
    return Object.values(state.currentBuild).every(s => s !== null);
}

function getFilledCount() {
    return Object.values(state.currentBuild).filter(s => s !== null).length;
}

function assembleBuild() {
    if (!isBuildComplete()) return;
    const power = getBuildPower();
    const tier = getBuildTier(power);
    state.bonusPoints += tier.bonus;
    state.buildsHistory.unshift({
        date: new Date().toLocaleDateString("ru"),
        tier: tier.name, stars: tier.stars, power, bonus: tier.bonus
    });
    for (const slot of Object.keys(state.currentBuild)) {
        const comp = state.currentBuild[slot];
        if (comp) {
            const idx = state.inventory.findIndex(i => i.id === comp.id);
            if (idx !== -1) state.inventory.splice(idx, 1);
        }
        state.currentBuild[slot] = null;
    }
    saveState();
    return tier;
}

// ========== UI: CASE RENDERING ==========

function renderCase() {
    const power = getBuildPower();
    const tier = getBuildTier(power);
    let filledCount = 0;

    // Update case visual tier
    const caseArea = document.getElementById("pc-case");
    if (caseArea) {
        caseArea.className = "pc-case-area tier-" + tier.stars;
    }

    // Background always stays as bg.png
    const bgImg = document.getElementById("pc-bg-image");
    if (bgImg && bgImg.src.indexOf("bg.png") === -1) {
        bgImg.src = "bg.png";
    }

    // Helper: update overlay image
    function updateLayer(elId, comp, images) {
        const el = document.getElementById(elId);
        if (!el) return;
        if (comp) {
            el.src = images[comp.rarity] || images.common;
            el.style.display = "block";
        } else {
            el.style.display = "none";
            el.src = "";
        }
    }

    const imgMap = { common: "1", rare: "2", epic: "3", legendary: "4" };
    const mkImages = (prefix) => {
        const m = {};
        for (const [r, n] of Object.entries(imgMap)) m[r] = `${prefix}-${n}.png`;
        return m;
    };

    updateLayer("pc-mb-image", state.currentBuild.mb, mkImages("mb"));
    updateLayer("pc-gpu-image", state.currentBuild.gpu, mkImages("gpu"));
    updateLayer("pc-cpu-image", state.currentBuild.cpu, mkImages("cpu"));
    updateLayer("pc-cool-image", state.currentBuild.cool, mkImages("cool"));
    updateLayer("pc-ram-image", state.currentBuild.ram, mkImages("ram"));
    updateLayer("pc-psu-image", state.currentBuild.psu, mkImages("psu"));

    // Update component grid (compact)
    const grid = document.getElementById("comp-grid");
    if (grid) {
        const slotOrder = ["cpu", "gpu", "ram", "mb", "psu", "cool"];
        grid.innerHTML = slotOrder.map(slot => {
            const comp = state.currentBuild[slot];
            const cat = CATEGORIES[slot];

            if (comp) {
                filledCount++;
                const rar = RARITIES[comp.rarity];
                return `
                    <div class="comp-slot filled ${comp.rarity}" data-slot="${slot}">
                        <div class="comp-slot-icon">${cat.icon}</div>
                        <div class="comp-slot-power" style="color:${rar.color}">⚡${comp.power}</div>
                    </div>`;
            }
            return `
                <div class="comp-slot empty" data-slot="${slot}">
                    <div class="comp-slot-icon">${cat.icon}</div>
                </div>`;
        }).join("");
    }

    // Slot click — open slot inventory popup
    if (grid) {
        grid.querySelectorAll(".comp-slot").forEach(el => {
            el.addEventListener("click", () => {
                const slot = el.dataset.slot;
                if (slot) openSlotPopup(slot);
            });
        });
    }

    // Update build bar
    document.getElementById("build-tier-name").textContent = tier.emoji + " " + tier.name;
    document.getElementById("build-power").textContent = "⚡" + power + " · " + filledCount + "/6";

    const maxPower = 700;
    document.getElementById("build-progress").style.width = Math.min(100, (power / maxPower) * 100) + "%";

    // Assemble button
    document.getElementById("btn-assemble").disabled = !isBuildComplete();

    document.getElementById("bonus-points").textContent = state.bonusPoints;
}

// ========== UI: DROP ANIMATION ==========

function showDrop(comp) {
    const overlay = document.getElementById("drop-overlay");
    const cat = CATEGORIES[comp.category];
    const rar = RARITIES[comp.rarity];

    // Glow color
    document.getElementById("drop-glow").style.background = rar.color;

    // Category name (big, first thing you see)
    const catEl = document.getElementById("drop-category");
    catEl.textContent = cat.name;
    catEl.style.color = rar.color;

    // Component display
    const compEl = document.getElementById("drop-component");
    compEl.style.borderColor = rar.color;
    document.getElementById("drop-comp-icon").textContent = cat.icon;

    // Info
    document.getElementById("drop-model").textContent = comp.model;
    document.getElementById("drop-model").style.color = rar.color;
    document.getElementById("drop-rarity").textContent = rar.name;
    document.getElementById("drop-rarity").style.color = rar.color;
    document.getElementById("drop-power").textContent = "⚡ " + comp.power + " мощности";

    // Auto-equip info
    const current = state.currentBuild[comp.category];
    const isUpgrade = !current || comp.power > current.power;
    const actionEl = document.getElementById("drop-action");
    if (isUpgrade) {
        actionEl.textContent = current
            ? `🔄 Заменит ${current.model} (⚡${current.power})`
            : `✅ Встанет в сборку`;
        actionEl.style.color = "#22c55e";
    } else {
        actionEl.textContent = `📦 В инвентарь (в сборке лучше)`;
        actionEl.style.color = "#94a3b8";
    }

    // Collect button
    const btnArea = document.getElementById("drop-info");
    let btn = btnArea.querySelector(".drop-collect-btn");
    if (!btn) {
        btn = document.createElement("button");
        btn.className = "drop-collect-btn";
        btn.textContent = "Забрать";
        btnArea.appendChild(btn);
    }

    btn.onclick = () => {
        overlay.classList.add("hidden");

        // Add to inventory
        state.inventory.push(comp);

        // Auto-equip if upgrade
        if (isUpgrade) {
            state.currentBuild[comp.category] = comp;
            saveState();
            flyComponentToSlot(comp, cat);
        } else {
            saveState();
            renderCase();
        }

        updateTicketTimer();

        // Check for 3 duplicates → recycle
        setTimeout(() => checkRecycle(comp.model), 100);
    };

    // Legendary special effects
    overlay.classList.remove("legendary");
    let particles = overlay.querySelector(".drop-particles");
    if (particles) particles.remove();

    if (comp.rarity === "legendary") {
        overlay.classList.add("legendary");
        // Add particles
        particles = document.createElement("div");
        particles.className = "drop-particles";
        for (let i = 0; i < 12; i++) {
            const p = document.createElement("span");
            const angle = (i / 12) * 360;
            const dist = 40 + Math.random() * 60;
            p.style.left = (100 + Math.cos(angle * Math.PI / 180) * dist) + "px";
            p.style.top = (100 + Math.sin(angle * Math.PI / 180) * dist) + "px";
            p.style.animationDelay = (Math.random() * 1) + "s";
            p.style.animationDuration = (1 + Math.random() * 1) + "s";
            particles.appendChild(p);
        }
        document.getElementById("drop-reveal").appendChild(particles);
    }

    overlay.classList.remove("hidden");
}

function flyComponentToSlot(comp, cat) {
    const flyEl = document.getElementById("flying-comp");
    const caseImg = document.getElementById("pc-bg-image");

    // Start: center of screen
    const startX = window.innerWidth / 2 - 25;
    const startY = window.innerHeight / 2 - 25;

    flyEl.textContent = cat.icon;
    flyEl.style.left = startX + "px";
    flyEl.style.top = startY + "px";
    flyEl.style.transform = "scale(1)";
    flyEl.style.opacity = "1";
    flyEl.classList.remove("hidden");

    // Target: center of PC case image
    requestAnimationFrame(() => {
        const caseRect = caseImg.getBoundingClientRect();
        const targetX = caseRect.left + caseRect.width * 0.45 - 25;
        const targetY = caseRect.top + caseRect.height * 0.55 - 25;

        flyEl.style.left = targetX + "px";
        flyEl.style.top = targetY + "px";
        flyEl.classList.add("fly");

        setTimeout(() => {
            flyEl.classList.add("hidden");
            flyEl.classList.remove("fly");

            // Flash zone
            const hw = document.getElementById("hw-" + comp.category);
            if (hw) {
                hw.classList.add("flash");
                setTimeout(() => hw.classList.remove("flash"), 150);
            }

            renderCase();
        }, 100);
    });
}

// Fly from card to case
function flyFromCardToCase(cardEl, comp) {
    const flyEl = document.getElementById("flying-comp");
    const caseImg = document.getElementById("pc-bg-image");
    const cat = CATEGORIES[comp.category];

    const cardRect = cardEl.getBoundingClientRect();
    flyEl.textContent = cat.icon;
    flyEl.style.left = (cardRect.left + 10) + "px";
    flyEl.style.top = (cardRect.top + 10) + "px";
    flyEl.style.transform = "scale(1)";
    flyEl.style.opacity = "1";
    flyEl.classList.remove("hidden");

    requestAnimationFrame(() => {
        const caseRect = caseImg.getBoundingClientRect();
        flyEl.style.left = (caseRect.left + caseRect.width * 0.45 - 25) + "px";
        flyEl.style.top = (caseRect.top + caseRect.height * 0.55 - 25) + "px";
        flyEl.classList.add("fly");

        setTimeout(() => {
            flyEl.classList.add("hidden");
            flyEl.classList.remove("fly");
            const hw = document.getElementById("hw-" + comp.category);
            if (hw) {
                hw.classList.add("flash");
                setTimeout(() => hw.classList.remove("flash"), 150);
            }
        }, 100);
    });
}

// ========== UI: TABS ==========

const mainView = document.querySelector(".case-container");
const actionArea = document.querySelector(".action-area");
const timerEl = document.querySelector(".ticket-timer");

document.querySelectorAll(".btab").forEach(tab => {
    tab.addEventListener("click", () => {
        document.querySelectorAll(".btab").forEach(t => t.classList.remove("active"));
        document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
        tab.classList.add("active");

        const tabName = tab.dataset.tab;
        if (tabName === "main") {
            mainView.style.display = "";
            actionArea.style.display = "";
            timerEl.style.display = "";
        } else {
            mainView.style.display = "none";
            actionArea.style.display = "none";
            timerEl.style.display = "none";
            document.getElementById("page-" + tabName).classList.add("active");
            if (tabName === "inventory") renderInventory();
            if (tabName === "rating") renderRating();
        }
    });
});

// ========== UI: DROP BUTTON ==========

document.getElementById("btn-drop").addEventListener("click", () => {
    const comp = doDrop();
    if (!comp) return;
    showDrop(comp);
});

// ========== UI: ASSEMBLE ==========

document.getElementById("btn-assemble").addEventListener("click", () => {
    const tier = assembleBuild();
    if (!tier) return;

    const modal = document.createElement("div");
    modal.className = "result-modal";
    modal.innerHTML = `
        <div class="result-content">
            <div class="result-emoji">${tier.emoji}</div>
            <div class="result-title">${tier.name}</div>
            <div class="result-stars">${"⭐".repeat(tier.stars)}</div>
            <div class="result-bonus">+${tier.bonus} бонусных баллов! 🪙</div>
            <button class="result-btn" onclick="this.closest('.result-modal').remove()">Отлично!</button>
        </div>
    `;
    document.body.appendChild(modal);

    renderCase();
});

// ========== UI: INVENTORY ==========

let invActiveCategory = "cpu";

function renderInvTabs() {
    const tabsEl = document.getElementById("inv-tabs");
    const catKeys = Object.keys(CATEGORIES);
    tabsEl.innerHTML = catKeys.map(key => {
        const cat = CATEGORIES[key];
        const count = state.inventory.filter(i => i.category === key).length;
        const isActive = key === invActiveCategory;
        return `<button class="inv-tab ${isActive ? 'active' : ''}" data-cat="${key}">
            <span class="inv-tab-icon">${cat.icon}</span>
            <span class="inv-tab-name">${cat.name}</span>
            ${count > 0 ? `<span class="inv-tab-count">${count}</span>` : ''}
        </button>`;
    }).join("");

    tabsEl.querySelectorAll(".inv-tab").forEach(btn => {
        btn.addEventListener("click", () => {
            invActiveCategory = btn.dataset.cat;
            renderInvTabs();
            renderInventoryList();
        });
    });
}

function renderInventoryList() {
    const list = document.getElementById("inventory-list");
    const items = state.inventory.filter(i => i.category === invActiveCategory);
    const rarOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
    items.sort((a, b) => rarOrder[a.rarity] - rarOrder[b.rarity] || b.power - a.power);

    const cat = CATEGORIES[invActiveCategory];
    const current = state.currentBuild[invActiveCategory];

    if (!items.length) {
        list.innerHTML = `<div class="inv-empty">Нет деталей: ${cat.name}. Выбивайте! 📦</div>`;
        return;
    }

    list.innerHTML = items.map(item => {
        const rar = RARITIES[item.rarity];
        const inBuild = current && current.id === item.id;
        return `
            <div class="inv-item ${item.rarity} ${inBuild ? 'equipped' : ''}" data-item-id="${item.id}">
                <div class="inv-item-icon">${cat.icon}</div>
                <div class="inv-item-info">
                    <div class="inv-item-name" style="color:${rar.color}">${item.model}</div>
                    <div class="inv-item-type">${rar.name} · ⚡${item.power}${inBuild ? " · 🖥 в сборке" : ""}</div>
                </div>
                <div class="inv-item-action">${inBuild ? "✓" : "⬅️"}</div>
            </div>
        `;
    }).join("");

    // Click to equip
    list.querySelectorAll(".inv-item:not(.equipped)").forEach(el => {
        el.addEventListener("click", () => {
            const itemId = parseFloat(el.dataset.itemId);
            const item = state.inventory.find(i => i.id === itemId);
            if (item) {
                state.currentBuild[invActiveCategory] = item;
                saveState();
                renderCase();
                renderInventoryList();
            }
        });
    });
}

function renderInventory() {
    renderInvTabs();
    renderInventoryList();
}

// ========== UI: SLOT POPUP ==========

function openSlotPopup(slot) {
    const popup = document.getElementById("slot-popup");
    const title = document.getElementById("slot-popup-title");
    const list = document.getElementById("slot-popup-list");
    const cat = CATEGORIES[slot];

    title.textContent = cat.icon + " " + cat.name;

    const items = state.inventory.filter(i => i.category === slot);
    const rarOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
    items.sort((a, b) => rarOrder[a.rarity] - rarOrder[b.rarity] || b.power - a.power);

    const current = state.currentBuild[slot];

    if (!items.length) {
        list.innerHTML = '<div class="inv-empty">Нет деталей этого типа. Выбивайте! 📦</div>';
    } else {
        list.innerHTML = items.map(item => {
            const rar = RARITIES[item.rarity];
            const inBuild = current && current.id === item.id;
            const isBetter = !current || item.power > current.power;
            return `
                <div class="inv-item ${item.rarity} ${inBuild ? 'equipped' : ''}" data-item-id="${item.id}" data-slot="${slot}">
                    <div class="inv-item-icon">${cat.icon}</div>
                    <div class="inv-item-info">
                        <div class="inv-item-name" style="color:${rar.color}">${item.model}</div>
                        <div class="inv-item-type">${rar.name} · ⚡${item.power}${inBuild ? " · 🖥 установлено" : (isBetter ? " · ⬆️ улучшение" : "")}</div>
                    </div>
                    <div class="inv-item-action">${inBuild ? "✓" : "⬅️"}</div>
                </div>
            `;
        }).join("");

        list.querySelectorAll(".inv-item:not(.equipped)").forEach(el => {
            el.addEventListener("click", () => {
                const itemId = parseFloat(el.dataset.itemId);
                const s = el.dataset.slot;
                const item = state.inventory.find(i => i.id === itemId);
                if (item) {
                    state.currentBuild[s] = item;
                    saveState();
                    renderCase();
                    openSlotPopup(s); // refresh popup
                }
            });
        });
    }

    popup.classList.remove("hidden");
}

document.getElementById("slot-popup-close").addEventListener("click", () => {
    document.getElementById("slot-popup").classList.add("hidden");
});

document.getElementById("slot-popup").addEventListener("click", (e) => {
    if (e.target.id === "slot-popup") {
        document.getElementById("slot-popup").classList.add("hidden");
    }
});

// ========== UI: RATING ==========

function renderRating() {
    document.getElementById("rating-tiers").innerHTML = BUILD_TIERS.map(t => `
        <div class="tier-card">
            <div class="tier-stars">${"⭐".repeat(t.stars)}${"☆".repeat(5 - t.stars)}</div>
            <div class="tier-info">
                <div class="tier-name">${t.emoji} ${t.name}</div>
                <div class="tier-desc">от ${t.minPower} мощности</div>
            </div>
            <div class="tier-bonus">+${t.bonus} 🪙</div>
        </div>
    `).join("");

    const histEl = document.getElementById("builds-history");
    if (!state.buildsHistory.length) {
        histEl.innerHTML = `
            <div class="history-title">📜 История сборок</div>
            <div class="history-empty">Вы ещё не собрали ни одного ПК</div>
        `;
        return;
    }

    histEl.innerHTML = `
        <div class="history-title">📜 История сборок</div>
        ${state.buildsHistory.map(b => `
            <div class="history-item">
                <div>
                    <div style="font-weight:600">${b.tier}</div>
                    <div style="font-size:11px;color:var(--text2)">${b.date} · ⚡${b.power}</div>
                </div>
                <div style="text-align:right">
                    <div>${"⭐".repeat(b.stars)}</div>
                    <div style="font-size:12px;color:var(--green);font-weight:600">+${b.bonus} 🪙</div>
                </div>
            </div>
        `).join("")}
    `;
}

// ========== BLUEPRINT ==========

const BLUEPRINT_POINTS = {
    // x,y = dot position (% of image)
    cool: { x: 32, y: 40 },
    cpu:  { x: 42, y: 45 },
    ram:  { x: 56, y: 41 },
    mb:   { x: 50, y: 50 },
    gpu:  { x: 44, y: 57 },
    psu:  { x: 55, y: 73 }
};

function renderBlueprint() {
    const svg = document.getElementById("blueprint-svg");
    if (!svg) return;

    let html = '';

    for (const [slot, bp] of Object.entries(BLUEPRINT_POINTS)) {
        const comp = state.currentBuild[slot];
        const rar = comp ? RARITIES[comp.rarity] : null;
        const color = rar ? rar.color : "rgba(255,255,255,0.5)";
        if (comp) {
            // Filled: bright dot with pulse
            html += `
                <circle cx="${bp.x}" cy="${bp.y}" r="4" fill="none" stroke="${color}" stroke-width="0.3" opacity="0.3">
                    <animate attributeName="r" values="3;6;3" dur="2s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite"/>
                </circle>
                <circle cx="${bp.x}" cy="${bp.y}" r="1.5" fill="${color}" opacity="0.9"/>
            `;
        } else {
            // Empty: dim small dot
            html += `
                <circle cx="${bp.x}" cy="${bp.y}" r="1" fill="rgba(255,255,255,0.4)" opacity="0.5">
                    <animate attributeName="opacity" values="0.3;0.6;0.3" dur="3s" repeatCount="indefinite"/>
                </circle>
            `;
        }
    }

    svg.innerHTML = html;
}

// ========== RECYCLE (3 duplicates → +1 ticket) ==========

function checkRecycle(model) {
    const dupes = state.inventory.filter(i => i.model === model);
    if (dupes.length < 3) return;

    // Don't recycle items currently in build
    const buildIds = Object.values(state.currentBuild).filter(b => b).map(b => b.id);
    const recyclable = dupes.filter(d => !buildIds.includes(d.id));
    if (recyclable.length < 3) return;

    // Remove 3 duplicates
    const toRemove = recyclable.slice(0, 3);
    for (const item of toRemove) {
        const idx = state.inventory.findIndex(i => i.id === item.id);
        if (idx !== -1) state.inventory.splice(idx, 1);
    }

    // Grant ticket
    state.tickets++;
    saveState();
    updateTicketTimer();
    renderCase();

    // Show recycle animation
    showRecycleAnimation(model, toRemove[0]);
}

function showRecycleAnimation(model, sample) {
    const cat = CATEGORIES[sample.category];
    const rar = RARITIES[sample.rarity];

    const modal = document.createElement("div");
    modal.className = "recycle-modal";
    modal.innerHTML = `
        <div class="recycle-content">
            <div class="recycle-icons">
                <div class="recycle-icon r1">${cat.icon}</div>
                <div class="recycle-icon r2">${cat.icon}</div>
                <div class="recycle-icon r3">${cat.icon}</div>
            </div>
            <div class="recycle-arrow">⚡</div>
            <div class="recycle-result">🎫</div>
            <div class="recycle-title">Переработка!</div>
            <div class="recycle-desc">3× <span style="color:${rar.color}">${model}</span></div>
            <div class="recycle-bonus">+1 попытка</div>
            <button class="recycle-btn" onclick="this.closest('.recycle-modal').remove()">Отлично!</button>
        </div>
    `;
    document.body.appendChild(modal);
}

// ========== DAILY LOGIN ==========

const DAILY_REWARDS = [
    { day: 1, tickets: 1, label: "+1 попытка" },
    { day: 2, tickets: 1, label: "+1 попытка" },
    { day: 3, tickets: 2, label: "+2 попытки" },
    { day: 4, tickets: 1, label: "+1 попытка" },
    { day: 5, tickets: 2, label: "+2 попытки" },
    { day: 6, tickets: 2, label: "+2 попытки" },
    { day: 7, tickets: 0, label: "Легендарная деталь!", legendary: true }
];

function getToday() {
    return new Date().toISOString().split("T")[0];
}

function checkDailyLogin() {
    const today = getToday();
    if (state.lastLoginDate === today) return; // already claimed

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    if (state.lastLoginDate === yesterdayStr) {
        state.loginStreak = Math.min(state.loginStreak + 1, 7);
    } else {
        state.loginStreak = 1;
    }

    state.lastLoginDate = today;
    const reward = DAILY_REWARDS[state.loginStreak - 1];

    // Give tickets
    if (reward.tickets > 0) {
        state.tickets += reward.tickets;
    }

    // Give legendary on day 7
    let legendaryComp = null;
    if (reward.legendary) {
        const catKeys = Object.keys(CATEGORIES);
        const category = catKeys[Math.floor(Math.random() * catKeys.length)];
        const models = COMPONENTS[category].legendary;
        const model = models[Math.floor(Math.random() * models.length)];
        const [minP, maxP] = RARITIES.legendary.power;
        const power = minP + Math.floor(Math.random() * (maxP - minP + 1));
        legendaryComp = { id: Date.now() + Math.random(), category, rarity: "legendary", model, power };
        state.inventory.push(legendaryComp);
        // Auto-equip if upgrade
        const current = state.currentBuild[category];
        if (!current || legendaryComp.power > current.power) {
            state.currentBuild[category] = legendaryComp;
        }
        state.loginStreak = 0; // reset streak after legendary
    }

    saveState();
    showDailyReward(reward, legendaryComp);
}

function showDailyReward(reward, legendaryComp) {
    const streakDots = DAILY_REWARDS.map((r, i) => {
        const done = i < state.loginStreak || (reward.legendary && i <= 6);
        const current = i === state.loginStreak - 1 || (reward.legendary && i === 6);
        const isLegendary = i === 6;
        return `<div class="streak-dot ${done ? 'done' : ''} ${current ? 'current' : ''} ${isLegendary ? 'legendary' : ''}">
            <span class="streak-day">${i + 1}</span>
            ${isLegendary ? '👑' : '🎫'}
        </div>`;
    }).join("");

    const modal = document.createElement("div");
    modal.className = "daily-modal";
    modal.innerHTML = `
        <div class="daily-content">
            <div class="daily-title">Ежедневный бонус!</div>
            <div class="daily-streak">${streakDots}</div>
            <div class="daily-day">День ${reward.legendary ? 7 : state.loginStreak}</div>
            <div class="daily-reward-icon">${reward.legendary ? '👑' : '🎫'}</div>
            <div class="daily-reward-text">${reward.label}</div>
            ${legendaryComp ? `<div class="daily-legendary">${CATEGORIES[legendaryComp.category].icon} ${legendaryComp.model}<br><span style="color:#f59e0b">⚡${legendaryComp.power}</span></div>` : ''}
            <button class="daily-btn" onclick="this.closest('.daily-modal').remove()">Забрать!</button>
        </div>
    `;
    document.body.appendChild(modal);
}

// ========== INIT ==========

// Reset button for admin
function resetAll() {
    localStorage.removeItem("reborn_pc_game_v2");
    state = defaultState();
    state.tickets = 99999;
    saveState();
    renderCase();
    updateTicketTimer();
}

function init() {
    regenTickets();

    // Admin: force unlimited tickets AFTER regen
    if (IS_ADMIN) {
        state.tickets = 99999;
        saveState();
    }

    updateTicketTimer();
    renderCase();
    setInterval(updateTicketTimer, 1000);

    if (window.Telegram && window.Telegram.WebApp) {
        Telegram.WebApp.ready();
        Telegram.WebApp.expand();
    }

    // Check daily login bonus
    setTimeout(() => checkDailyLogin(), 500);
}

init();
