// ========== DATA ==========

const CATEGORIES = {
    cpu:  { name: "Процессор",    icon: "🧠" },
    gpu:  { name: "Видеокарта",   icon: "🎮" },
    ram:  { name: "Оперативная",  icon: "💾" },
    mb:   { name: "Мат. плата",   icon: "🔲" },
    psu:  { name: "Блок питания", icon: "🔌" },
    case: { name: "Накопитель",    icon: "💿" },
    cool: { name: "Охлаждение",   icon: "❄️" }
};

const RARITIES = {
    common:    { name: "Обычная",    chance: 0.55, color: "#9ca3af", power: [10, 25] },
    uncommon:  { name: "Необычная",  chance: 0.25, color: "#22c55e", power: [26, 50] },
    rare:      { name: "Редкая",     chance: 0.12, color: "#3b82f6", power: [51, 75] },
    epic:      { name: "Эпическая",  chance: 0.06, color: "#a855f7", power: [76, 92] },
    legendary: { name: "Легендарная", chance: 0.02, color: "#f59e0b", power: [93, 100] }
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
        legendary: ["ASUS ROG Crosshair X670E", "MSI MEG Z790 GODLIKE"]
    },
    psu: {
        common:    ["500W Be Quiet", "550W Corsair CV", "500W Deepcool"],
        uncommon:  ["650W Corsair RM", "700W Be Quiet Pure", "650W Seasonic Focus"],
        rare:      ["850W Corsair RM850x", "850W Seasonic GX"],
        epic:      ["1000W Corsair HX1000", "1000W Be Quiet Dark"],
        legendary: ["1200W Corsair AX1200i", "1600W ROG Thor"]
    },
    case: {
        common:    ["Kingston A400 240GB", "WD Green 480GB", "Crucial BX500 240GB"],
        uncommon:  ["Samsung 870 EVO 500GB", "WD Blue SN570 500GB", "Crucial P3 500GB"],
        rare:      ["Samsung 980 Pro 1TB", "WD Black SN770 1TB", "Kingston KC3000 1TB"],
        epic:      ["Samsung 990 Pro 2TB", "WD Black SN850X 2TB"],
        legendary: ["Samsung 990 Pro 4TB", "Seagate FireCuda 530 4TB"]
    },
    cool: {
        common:    ["ID-Cooling SE-214", "Deepcool GAMMAXX 400", "Hyper 212"],
        uncommon:  ["Be Quiet Pure Rock 2", "Noctua NH-U12S", "Arctic Freezer 34"],
        rare:      ["Noctua NH-D15", "Be Quiet Dark Rock Pro", "Corsair H100i"],
        epic:      ["NZXT Kraken X73", "Corsair H150i Elite"],
        legendary: ["ROG RYUJIN III 360", "Kraken Z73 Elite"]
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
        currentBuild: { cpu: null, gpu: null, ram: null, mb: null, psu: null, case: null, cool: null },
        buildsHistory: []
    };
}

function loadState() {
    try {
        const s = localStorage.getItem("reborn_pc_game_v2");
        if (s) return JSON.parse(s);
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
    let tier = BUILD_TIERS[0];
    for (const t of BUILD_TIERS) if (power >= t.minPower) tier = t;
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

    // Swap case image based on GPU rarity
    const bgImg = document.getElementById("pc-bg-image");
    if (bgImg) {
        const gpu = state.currentBuild.gpu;
        if (!gpu) {
            bgImg.src = "bg.png";
        } else {
            const gpuImages = {
                common: "gpu-1.png",
                uncommon: "gpu-1.png",
                rare: "gpu-2.png",
                epic: "gpu-3.png",
                legendary: "gpu-4.png"
            };
            bgImg.src = gpuImages[gpu.rarity] || "bg-gpu.png";
        }
    }

    // RAM overlay
    const ramEl = document.getElementById("hw-ram");
    if (ramEl) {
        const ram = state.currentBuild.ram;
        if (ram) {
            const ramImages = {
                common: "ram-1.png",
                uncommon: "ram-1.png",
                rare: "ram-2.png",
                epic: "ram-3.png",
                legendary: "ram-4.png"
            };
            ramEl.style.backgroundImage = `url(${ramImages[ram.rarity] || "ram-1.png"})`;
            ramEl.classList.add("active");
        } else {
            ramEl.classList.remove("active");
            ramEl.style.backgroundImage = "";
        }
    }

    // Update component grid
    const grid = document.getElementById("comp-grid");
    if (grid) {
        const slotOrder = ["cpu", "cool", "ram", "mb", "gpu", "psu", "case"];
        grid.innerHTML = slotOrder.map(slot => {
            const comp = state.currentBuild[slot];
            const cat = CATEGORIES[slot];
            const isWide = slot === "gpu";

            if (comp) {
                filledCount++;
                const rar = RARITIES[comp.rarity];
                return `
                    <div class="comp-card filled ${comp.rarity}${isWide ? ' wide' : ''}" data-slot="${slot}">
                        <div class="comp-icon">${cat.icon}</div>
                        <div class="comp-info">
                            <div class="comp-type">${cat.name}</div>
                            <div class="comp-name" style="color:${rar.color}">${comp.model}</div>
                        </div>
                        <div class="comp-power">⚡${comp.power}</div>
                        <div class="comp-check">✓</div>
                    </div>`;
            }
            return `
                <div class="comp-card empty${isWide ? ' wide' : ''}">
                    <div class="comp-icon">${cat.icon}</div>
                    <div class="comp-info">
                        <div class="comp-type">${cat.name}</div>
                        <div class="comp-name">Пусто</div>
                    </div>
                </div>`;
        }).join("");
    }

    // Card click — fly to case
    if (grid) {
        grid.querySelectorAll(".comp-card.filled").forEach(card => {
            card.addEventListener("click", () => {
                const slot = card.dataset.slot;
                const comp = state.currentBuild[slot];
                if (comp) {
                    card.classList.add("installing");
                    setTimeout(() => card.classList.remove("installing"), 500);
                    flyFromCardToCase(card, comp);
                }
            });
        });
    }

    // Update build bar
    document.getElementById("build-tier-name").textContent = tier.emoji + " " + tier.name;
    document.getElementById("build-stars").textContent = "⭐".repeat(tier.stars);
    document.getElementById("build-power").textContent = power;
    document.getElementById("build-count").textContent = filledCount + "/7";

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

    // Component display
    const compEl = document.getElementById("drop-component");
    compEl.style.borderColor = rar.color;
    document.getElementById("drop-comp-icon").textContent = cat.icon;

    // Info
    document.getElementById("drop-rarity").textContent = rar.name;
    document.getElementById("drop-rarity").style.color = rar.color;
    document.getElementById("drop-model").textContent = comp.model;
    document.getElementById("drop-model").style.color = rar.color;
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
    };

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
                setTimeout(() => hw.classList.remove("flash"), 600);
            }

            renderCase();
        }, 700);
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
                setTimeout(() => hw.classList.remove("flash"), 600);
            }
        }, 700);
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

let currentFilter = "all";

document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentFilter = btn.dataset.filter;
        renderInventory();
    });
});

function renderInventory() {
    const list = document.getElementById("inventory-list");
    let items = state.inventory;

    if (currentFilter !== "all") items = items.filter(i => i.category === currentFilter);

    const rarOrder = { legendary: 0, epic: 1, rare: 2, uncommon: 3, common: 4 };
    items.sort((a, b) => rarOrder[a.rarity] - rarOrder[b.rarity] || b.power - a.power);

    if (!items.length) {
        list.innerHTML = '<div class="inv-empty">Пока пусто. Выбивайте детали! 📦</div>';
        return;
    }

    list.innerHTML = items.map(item => {
        const cat = CATEGORIES[item.category];
        const rar = RARITIES[item.rarity];
        const inBuild = Object.values(state.currentBuild).some(b => b && b.id === item.id);
        return `
            <div class="inv-item ${item.rarity}">
                <div class="inv-item-icon">${cat.icon}</div>
                <div class="inv-item-info">
                    <div class="inv-item-name" style="color:${rar.color}">${item.model}</div>
                    <div class="inv-item-type">${cat.name} · ${rar.name}${inBuild ? " · 🖥 в сборке" : ""}</div>
                </div>
                <div class="inv-item-power">⚡${item.power}</div>
            </div>
        `;
    }).join("");
}

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
    psu:  { x: 55, y: 73 },
    case: { x: 36, y: 70 }
};

function renderBlueprint() {
    const svg = document.getElementById("blueprint-svg");
    if (!svg) return;

    let html = '';

    for (const [slot, bp] of Object.entries(BLUEPRINT_POINTS)) {
        const comp = state.currentBuild[slot];
        const rar = comp ? RARITIES[comp.rarity] : null;
        const color = rar ? rar.color : "rgba(147,51,234,0.5)";
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
                <circle cx="${bp.x}" cy="${bp.y}" r="1" fill="rgba(147,51,234,0.4)" opacity="0.5">
                    <animate attributeName="opacity" values="0.3;0.6;0.3" dur="3s" repeatCount="indefinite"/>
                </circle>
            `;
        }
    }

    svg.innerHTML = html;
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
}

init();
