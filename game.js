// ========== DATA ==========

const CATEGORIES = {
    cpu:  { name: "Процессор",    icon: "🧠", slot: "cpu" },
    gpu:  { name: "Видеокарта",   icon: "🎮", slot: "gpu" },
    ram:  { name: "Оперативная",  icon: "💾", slot: "ram" },
    mb:   { name: "Мат. плата",   icon: "🔲", slot: "mb" },
    psu:  { name: "Блок питания", icon: "🔌", slot: "psu" },
    case: { name: "Корпус",       icon: "🖥", slot: "case" },
    cool: { name: "Охлаждение",   icon: "❄️", slot: "cool" }
};

const RARITIES = {
    common:    { name: "Обычная",      chance: 0.55, color: "#9ca3af", power: [10, 25],  mult: 1 },
    uncommon:  { name: "Необычная",    chance: 0.25, color: "#22c55e", power: [26, 50],  mult: 2 },
    rare:      { name: "Редкая",       chance: 0.12, color: "#3b82f6", power: [51, 75],  mult: 3 },
    epic:      { name: "Эпическая",    chance: 0.06, color: "#a855f7", power: [76, 92],  mult: 5 },
    legendary: { name: "Легендарная",   chance: 0.02, color: "#f59e0b", power: [93, 100], mult: 10 }
};

const COMPONENTS = {
    cpu: {
        common:    ["Intel i3-12100", "AMD Ryzen 3 4100", "Intel Pentium G7400"],
        uncommon:  ["Intel i5-12400F", "AMD Ryzen 5 5600", "Intel i5-13400"],
        rare:      ["Intel i7-13700K", "AMD Ryzen 7 7700X", "Intel i7-14700K"],
        epic:      ["Intel i9-13900K", "AMD Ryzen 9 7900X"],
        legendary: ["Intel i9-14900KS", "AMD Ryzen 9 7950X3D"]
    },
    gpu: {
        common:    ["GTX 1650", "RX 6500 XT", "GTX 1050 Ti"],
        uncommon:  ["RTX 3060", "RX 6600 XT", "RTX 4060"],
        rare:      ["RTX 4070 Super", "RX 7800 XT", "RTX 3080"],
        epic:      ["RTX 4080 Super", "RX 7900 XTX"],
        legendary: ["RTX 4090", "RTX 4090 Ti"]
    },
    ram: {
        common:    ["DDR4 8GB 2666MHz", "DDR4 16GB 2666MHz"],
        uncommon:  ["DDR4 16GB 3200MHz", "DDR5 16GB 4800MHz"],
        rare:      ["DDR5 32GB 5600MHz", "DDR4 32GB 3600MHz"],
        epic:      ["DDR5 32GB 6400MHz", "DDR5 64GB 5600MHz"],
        legendary: ["DDR5 64GB 7200MHz", "DDR5 48GB 8000MHz"]
    },
    mb: {
        common:    ["ASUS Prime H610", "Gigabyte H510M", "MSI PRO B660"],
        uncommon:  ["MSI B550 Tomahawk", "ASUS TUF B660", "Gigabyte B550 AORUS"],
        rare:      ["ASUS ROG Strix B550-F", "MSI MAG X570S", "Gigabyte Z690 AORUS"],
        epic:      ["ASUS ROG Maximus Z790", "MSI MEG Z690 ACE"],
        legendary: ["ASUS ROG Crosshair X670E Extreme", "MSI MEG Z790 GODLIKE"]
    },
    psu: {
        common:    ["500W Be Quiet", "550W Corsair CV", "500W Deepcool"],
        uncommon:  ["650W Corsair RM", "700W Be Quiet Pure Power", "650W Seasonic Focus"],
        rare:      ["850W Corsair RM850x", "850W Seasonic Focus GX"],
        epic:      ["1000W Corsair HX1000", "1000W Be Quiet Dark Power"],
        legendary: ["1200W Corsair AX1200i", "1600W ASUS ROG Thor"]
    },
    case: {
        common:    ["Deepcool CC360", "AeroCool Cylon", "Zalman S2"],
        uncommon:  ["NZXT H5 Flow", "Corsair 4000D", "Fractal Pop Air"],
        rare:      ["Lian Li O11 Dynamic", "Corsair 5000T", "Be Quiet 802"],
        epic:      ["Lian Li O11 Vision", "HYTE Y60"],
        legendary: ["Lian Li O11D EVO XL", "Phanteks NV9"]
    },
    cool: {
        common:    ["ID-Cooling SE-214", "Deepcool GAMMAXX 400", "Cooler Master Hyper 212"],
        uncommon:  ["Be Quiet Pure Rock 2", "Noctua NH-U12S", "Arctic Freezer 34"],
        rare:      ["Noctua NH-D15", "Be Quiet Dark Rock Pro 4", "Corsair H100i"],
        epic:      ["NZXT Kraken X73", "Corsair H150i Elite"],
        legendary: ["ASUS ROG RYUJIN III 360", "NZXT Kraken Z73 Elite"]
    }
};

const BUILD_TIERS = [
    { name: "Офисный ПК",      stars: 1, minPower: 0,   bonus: 10,  emoji: "🖨" },
    { name: "Домашний ПК",     stars: 2, minPower: 150, bonus: 30,  emoji: "🏠" },
    { name: "Игровой ПК",      stars: 3, minPower: 300, bonus: 75,  emoji: "🎮" },
    { name: "Pro Gaming ПК",   stars: 4, minPower: 470, bonus: 200, emoji: "🔥" },
    { name: "Ultimate ПК",     stars: 5, minPower: 600, bonus: 500, emoji: "👑" }
];

const MAX_TICKETS = 5;
const TICKET_REGEN_MS = 30 * 60 * 1000; // 30 минут

// ========== STATE ==========

let state = loadState();

function defaultState() {
    return {
        tickets: MAX_TICKETS,
        lastTicketTime: Date.now(),
        bonusPoints: 0,
        inventory: [],
        currentBuild: { cpu: null, gpu: null, ram: null, mb: null, psu: null, case: null, cool: null },
        buildsHistory: []
    };
}

function loadState() {
    try {
        const saved = localStorage.getItem("reborn_pc_game");
        if (saved) return JSON.parse(saved);
    } catch(e) {}
    return defaultState();
}

function saveState() {
    localStorage.setItem("reborn_pc_game", JSON.stringify(state));
}

// ========== TICKET SYSTEM ==========

function regenTickets() {
    if (state.tickets >= MAX_TICKETS) {
        state.lastTicketTime = Date.now();
        return;
    }
    const elapsed = Date.now() - state.lastTicketTime;
    const newTickets = Math.floor(elapsed / TICKET_REGEN_MS);
    if (newTickets > 0) {
        state.tickets = Math.min(MAX_TICKETS, state.tickets + newTickets);
        state.lastTicketTime = Date.now();
        saveState();
    }
}

function updateTicketTimer() {
    regenTickets();
    const el = document.getElementById("ticket-timer");
    const ticketEl = document.getElementById("tickets");
    ticketEl.textContent = state.tickets;

    if (state.tickets >= MAX_TICKETS) {
        el.textContent = "Все билеты доступны!";
    } else {
        const elapsed = Date.now() - state.lastTicketTime;
        const remaining = TICKET_REGEN_MS - elapsed;
        const min = Math.floor(remaining / 60000);
        const sec = Math.floor((remaining % 60000) / 1000);
        el.textContent = `Следующий билет через ${min}:${sec.toString().padStart(2, "0")}`;
    }
}

// ========== DROP SYSTEM ==========

function rollRarity() {
    const roll = Math.random();
    let cumulative = 0;
    for (const [key, rarity] of Object.entries(RARITIES)) {
        cumulative += rarity.chance;
        if (roll <= cumulative) return key;
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

    return {
        id: Date.now() + Math.random(),
        category,
        rarity,
        model,
        power
    };
}

function doDrop() {
    regenTickets();
    if (state.tickets <= 0) return null;

    state.tickets--;
    state.lastTicketTime = state.tickets < MAX_TICKETS && state.lastTicketTime === 0
        ? Date.now() : state.lastTicketTime;
    if (state.tickets === MAX_TICKETS - 1) {
        state.lastTicketTime = Date.now();
    }

    const component = rollComponent();
    saveState();
    return component;
}

// ========== BUILD SYSTEM ==========

function getBuildPower() {
    let total = 0;
    for (const slot of Object.values(state.currentBuild)) {
        if (slot) total += slot.power;
    }
    return total;
}

function getBuildTier(power) {
    let tier = BUILD_TIERS[0];
    for (const t of BUILD_TIERS) {
        if (power >= t.minPower) tier = t;
    }
    return tier;
}

function isBuildComplete() {
    return Object.values(state.currentBuild).every(s => s !== null);
}

function assembleBuild() {
    if (!isBuildComplete()) return;

    const power = getBuildPower();
    const tier = getBuildTier(power);

    state.bonusPoints += tier.bonus;

    state.buildsHistory.unshift({
        date: new Date().toLocaleDateString("ru"),
        tier: tier.name,
        stars: tier.stars,
        power,
        bonus: tier.bonus
    });

    // Remove used components from inventory
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

// ========== UI ==========

// Tabs
document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
        document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
        document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
        tab.classList.add("active");
        document.getElementById("page-" + tab.dataset.tab).classList.add("active");

        if (tab.dataset.tab === "inventory") renderInventory();
        if (tab.dataset.tab === "build") renderBuild();
        if (tab.dataset.tab === "rating") renderRating();
    });
});

// Drop
const dropBox = document.getElementById("drop-box");
const dropResult = document.getElementById("drop-result");
const dropBoxInner = document.getElementById("drop-box-inner");

dropBox.addEventListener("click", () => {
    const comp = doDrop();
    if (!comp) {
        dropBox.style.borderColor = "#ef4444";
        setTimeout(() => dropBox.style.borderColor = "", 500);
        return;
    }

    dropBox.classList.add("opening");
    dropBoxInner.style.display = "none";

    setTimeout(() => {
        dropBox.classList.remove("opening");
        dropBox.style.display = "none";
        dropResult.classList.remove("hidden");

        const cat = CATEGORIES[comp.category];
        const rar = RARITIES[comp.rarity];

        document.getElementById("result-rarity").textContent = rar.name;
        document.getElementById("result-rarity").className = "result-rarity " + comp.rarity;
        document.getElementById("result-icon").textContent = cat.icon;
        document.getElementById("result-name").textContent = cat.name;
        document.getElementById("result-model").textContent = comp.model;
        document.getElementById("result-model").style.color = rar.color;
        document.getElementById("result-power").textContent = "⚡ " + comp.power + " очков мощности";

        // Auto-equip info
        const currentInSlot = state.currentBuild[comp.category];
        const isUpgrade = !currentInSlot || comp.power > currentInSlot.power;
        const autoEquipInfo = document.getElementById("auto-equip-info");
        if (autoEquipInfo) autoEquipInfo.remove();

        if (isUpgrade) {
            const info = document.createElement("div");
            info.id = "auto-equip-info";
            info.style.cssText = "color:#22c55e;font-size:13px;margin-top:8px;font-weight:600;";
            info.textContent = currentInSlot
                ? `🔄 Заменит ${currentInSlot.model} (⚡${currentInSlot.power}) в сборке`
                : `✅ Автоматически встанет в сборку`;
            document.getElementById("result-power").after(info);
        }

        document.getElementById("btn-collect").onclick = () => {
            state.inventory.push(comp);

            // Auto-equip: if better than current slot — put in build
            const slotComp = state.currentBuild[comp.category];
            if (!slotComp || comp.power > slotComp.power) {
                // Return old component to free inventory (unlink from build)
                state.currentBuild[comp.category] = comp;
            }

            saveState();

            dropResult.classList.add("hidden");
            dropBox.style.display = "flex";
            dropBoxInner.style.display = "block";
            updateTicketTimer();
        };

        updateTicketTimer();
    }, 600);
});

// Inventory
const filterBtns = document.querySelectorAll(".filter-btn");
let currentFilter = "all";

filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        filterBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentFilter = btn.dataset.filter;
        renderInventory();
    });
});

function renderInventory() {
    const list = document.getElementById("inventory-list");
    let items = state.inventory;

    if (currentFilter !== "all") {
        items = items.filter(i => i.category === currentFilter);
    }

    // Sort by rarity (legendary first) then power
    const rarOrder = { legendary: 0, epic: 1, rare: 2, uncommon: 3, common: 4 };
    items.sort((a, b) => rarOrder[a.rarity] - rarOrder[b.rarity] || b.power - a.power);

    if (items.length === 0) {
        list.innerHTML = '<div class="inv-empty">Пока пусто. Открывайте дропы! 📦</div>';
        return;
    }

    list.innerHTML = items.map(item => {
        const cat = CATEGORIES[item.category];
        const rar = RARITIES[item.rarity];
        return `
            <div class="inv-item ${item.rarity}">
                <div class="inv-item-icon">${cat.icon}</div>
                <div class="inv-item-info">
                    <div class="inv-item-name" style="color:${rar.color}">${item.model}</div>
                    <div class="inv-item-type">${cat.name} · ${rar.name}</div>
                </div>
                <div class="inv-item-power">⚡${item.power}</div>
            </div>
        `;
    }).join("");
}

// Build
function renderBuild() {
    const slotsEl = document.getElementById("build-slots");
    const slots = Object.keys(CATEGORIES);

    slotsEl.innerHTML = slots.map(slot => {
        const cat = CATEGORIES[slot];
        const comp = state.currentBuild[slot];

        if (comp) {
            const rar = RARITIES[comp.rarity];
            return `
                <div class="build-slot filled ${comp.rarity}" data-slot="${slot}">
                    <div class="slot-icon">${cat.icon}</div>
                    <div class="slot-info">
                        <div class="slot-label">${cat.name}</div>
                        <div class="slot-value" style="color:${rar.color}">${comp.model} <span style="color:var(--accent2)">⚡${comp.power}</span></div>
                    </div>
                    <div class="slot-clear" data-clear="${slot}">✕</div>
                </div>
            `;
        }

        return `
            <div class="build-slot" data-slot="${slot}">
                <div class="slot-icon">${cat.icon}</div>
                <div class="slot-info">
                    <div class="slot-label">${cat.name}</div>
                    <div class="slot-value" style="color:var(--text2)">Нажми чтобы выбрать</div>
                </div>
            </div>
        `;
    }).join("");

    // Rating preview
    const power = getBuildPower();
    const tier = getBuildTier(power);
    const filledCount = Object.values(state.currentBuild).filter(s => s).length;
    const ratingEl = document.getElementById("build-rating");

    const starsStr = "⭐".repeat(tier.stars) + "☆".repeat(5 - tier.stars);
    ratingEl.innerHTML = `
        <div class="build-rating-label">Рейтинг сборки (${filledCount}/7 комплектующих)</div>
        <div class="build-rating-stars">${starsStr}</div>
        <div class="build-rating-name">${tier.emoji} ${tier.name}</div>
        <div class="build-rating-bonus">Бонус: +${tier.bonus} 🪙</div>
    `;

    // Assemble button
    const assembleBtn = document.getElementById("btn-assemble");
    assembleBtn.disabled = !isBuildComplete();

    // Click handlers
    document.querySelectorAll(".build-slot").forEach(el => {
        el.addEventListener("click", (e) => {
            if (e.target.dataset.clear) {
                state.currentBuild[e.target.dataset.clear] = null;
                saveState();
                renderBuild();
                return;
            }
            const slot = el.dataset.slot;
            showComponentPicker(slot);
        });
    });

    document.querySelectorAll(".slot-clear").forEach(el => {
        el.addEventListener("click", (e) => {
            e.stopPropagation();
            state.currentBuild[el.dataset.clear] = null;
            saveState();
            renderBuild();
        });
    });
}

function showComponentPicker(slot) {
    const available = state.inventory.filter(i =>
        i.category === slot &&
        !Object.values(state.currentBuild).some(b => b && b.id === i.id)
    );

    const rarOrder = { legendary: 0, epic: 1, rare: 2, uncommon: 3, common: 4 };
    available.sort((a, b) => rarOrder[a.rarity] - rarOrder[b.rarity] || b.power - a.power);

    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";

    const cat = CATEGORIES[slot];

    overlay.innerHTML = `
        <div class="modal">
            <div class="modal-title">${cat.icon} Выбери ${cat.name}</div>
            ${available.length === 0 ? '<div class="inv-empty">Нет доступных. Откройте дропы!</div>' : ""}
            ${available.map(item => {
                const rar = RARITIES[item.rarity];
                return `
                    <div class="modal-item" data-id="${item.id}">
                        <div class="inv-item-icon">${cat.icon}</div>
                        <div class="inv-item-info">
                            <div class="inv-item-name" style="color:${rar.color}">${item.model}</div>
                            <div class="inv-item-type">${rar.name}</div>
                        </div>
                        <div class="inv-item-power">⚡${item.power}</div>
                    </div>
                `;
            }).join("")}
            <div class="modal-close">Закрыть</div>
        </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelector(".modal-close").addEventListener("click", () => overlay.remove());
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) overlay.remove();
    });

    overlay.querySelectorAll(".modal-item").forEach(el => {
        el.addEventListener("click", () => {
            const id = parseFloat(el.dataset.id);
            const comp = state.inventory.find(i => i.id === id);
            if (comp) {
                state.currentBuild[slot] = comp;
                saveState();
                overlay.remove();
                renderBuild();
            }
        });
    });
}

// Assemble
document.getElementById("btn-assemble").addEventListener("click", () => {
    const tier = assembleBuild();
    if (!tier) return;

    document.getElementById("bonus-points").textContent = state.bonusPoints;

    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.innerHTML = `
        <div class="modal" style="text-align:center; padding:30px;">
            <div style="font-size:48px; margin-bottom:16px;">${tier.emoji}</div>
            <div style="font-size:24px; font-weight:700; margin-bottom:8px;">${tier.name}</div>
            <div style="font-size:28px; letter-spacing:4px;">${"⭐".repeat(tier.stars)}</div>
            <div style="font-size:18px; color:#22c55e; margin-top:12px; font-weight:700;">+${tier.bonus} бонусных баллов! 🪙</div>
            <button class="btn btn-primary" style="margin-top:20px;" onclick="this.closest('.modal-overlay').remove()">Отлично!</button>
        </div>
    `;
    document.body.appendChild(overlay);

    renderBuild();
});

// Rating page
function renderRating() {
    const tiersEl = document.getElementById("rating-tiers");
    tiersEl.innerHTML = BUILD_TIERS.map(t => `
        <div class="tier-card">
            <div class="tier-stars">${"⭐".repeat(t.stars)}${"☆".repeat(5 - t.stars)}</div>
            <div class="tier-info">
                <div class="tier-name">${t.emoji} ${t.name}</div>
                <div class="tier-desc">от ${t.minPower} очков мощности</div>
            </div>
            <div class="tier-bonus">+${t.bonus} 🪙</div>
        </div>
    `).join("");

    const histEl = document.getElementById("builds-history");
    if (state.buildsHistory.length === 0) {
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
                    <div style="font-size:12px;color:var(--text2)">${b.date} · ⚡${b.power}</div>
                </div>
                <div>
                    <div class="history-stars">${"⭐".repeat(b.stars)}</div>
                    <div class="history-bonus">+${b.bonus} 🪙</div>
                </div>
            </div>
        `).join("")}
    `;
}

// ========== INIT ==========

function init() {
    regenTickets();
    updateTicketTimer();
    document.getElementById("bonus-points").textContent = state.bonusPoints;
    setInterval(updateTicketTimer, 1000);

    // Telegram WebApp
    if (window.Telegram && window.Telegram.WebApp) {
        Telegram.WebApp.ready();
        Telegram.WebApp.expand();
    }
}

init();
