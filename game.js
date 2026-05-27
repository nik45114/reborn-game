// ========== DATA ==========

const CATEGORIES = {
    cpu:  { name: "Процессор",    icon: "🧠" },
    gpu:  { name: "Видеокарта",   icon: "🎮" },
    ram:  { name: "Оперативная",  icon: "💾" },
    mb:   { name: "Мат. плата",   icon: "🔲" },
    psu:  { name: "Блок питания", icon: "🔌" },
    cool: { name: "Охлаждение",   icon: "❄️" }
};

const SLOT_LABELS = {
    cpu: "CPU",
    gpu: "GPU",
    ram: "RAM",
    mb: "Плата",
    psu: "БП",
    cool: "Кулер"
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
        common:    ["200W Switching"],
        rare:      ["400W Switching"],
        epic:      ["600W Switching"],
        legendary: ["850W Switching"]
    },
    cool: {
        common:    ["ID-Cooling SE-214"],
        rare:      ["Noctua NH-U12A"],
        epic:      ["Noctua NH-D15"],
        legendary: ["ROG RYUJIN III 360"]
    }
};

// Percent positions on the case bg.png where each category visually appears.
// Synced with compose.py center coordinates: xp = cx/1536*100, yp = cy/1024*100.
// Used by the drop-flight animation to land each part at its actual slot.
// pipeline_server.py keeps these in sync on every Save & Deploy.
const SLOT_POSITIONS = {
    cpu:  { xp: 47.8, yp: 44.9 },
    gpu:  { xp: 46.4, yp: 59.8 },
    ram:  { xp: 52.8, yp: 45.8 },
    mb:   { xp: 47.8, yp: 50.4 },
    psu:  { xp: 39.9, yp: 71.3 },
    cool: { xp: 48.2, yp: 44.7 }
};

const BUILD_TIERS = [
    { name: "Офисный ПК",      stars: 1, minPower: 0,   bonus: 25,  emoji: "🖨" },
    { name: "Домашний ПК",     stars: 2, minPower: 150, bonus: 50,  emoji: "🏠" },
    { name: "Игровой ПК",      stars: 3, minPower: 300, bonus: 100, emoji: "🎮" },
    { name: "Pro Gaming ПК",   stars: 4, minPower: 470, bonus: 200, emoji: "🔥" },
    { name: "Ultimate ПК",     stars: 5, minPower: 600, bonus: 350, emoji: "👑" }
];

// Admins get unlimited tickets; everyone else gets +5 ingame coupons every
// day at 12:00 МСК that ACCUMULATE within the current bonus window
// (1–14 / 15–end of month). Whatever didn't get spent is wiped at the
// window boundary, so people can stockpile up to ~14 × 5 = 70 + initial 5
// tickets if they grind right before window-end.
const ADMIN_TG_IDS = new Set([7704310171, 711296726, 5046401423]);
const ADMIN_MAX_TICKETS = 99999;
const ADMIN_REGEN_MS = 1000;
const USER_MAX_TICKETS = 5;            // daily noon allotment (additive)
const USER_TICKET_CAP = 100;           // hard cap on accumulated stash
const USER_REGEN_MS = Math.floor(24 * 60 * 60 * 1000 / USER_MAX_TICKETS);

let IS_ADMIN = false;
let MAX_TICKETS = USER_TICKET_CAP;
let TICKET_REGEN_MS = USER_REGEN_MS;

function detectAdmin() {
    try {
        // Path 1: Telegram delivered user.id via initDataUnsafe (normal case).
        const raw = window.Telegram && window.Telegram.WebApp
            && window.Telegram.WebApp.initDataUnsafe
            && window.Telegram.WebApp.initDataUnsafe.user
            && window.Telegram.WebApp.initDataUnsafe.user.id;
        if (raw) {
            const asNum = Number(raw);
            if (ADMIN_TG_IDS.has(asNum) || ADMIN_TG_IDS.has(String(raw))) return true;
        }
        // Path 2: bot tagged the URL with ?admin=<id> when sending the
        // reply-keyboard to a known admin. Used when initDataUnsafe is empty
        // (some Android Telegram launches don't populate user there).
        const params = new URLSearchParams(window.location.search);
        const adminParam = params.get("admin");
        if (adminParam) {
            const asNum = Number(adminParam);
            if (ADMIN_TG_IDS.has(asNum) || ADMIN_TG_IDS.has(adminParam)) return true;
        }
        return false;
    } catch (e) { return false; }
}

function applyTier() {
    IS_ADMIN = detectAdmin();
    MAX_TICKETS = IS_ADMIN ? ADMIN_MAX_TICKETS : USER_TICKET_CAP;
    TICKET_REGEN_MS = IS_ADMIN ? ADMIN_REGEN_MS : USER_REGEN_MS;

    // Surface tier + raw user.id in the bottom-right version badge so we can
    // see at a glance whether admin detection actually fired.
    try {
        const el = document.getElementById("app-version");
        if (el) {
            const id = window.Telegram && Telegram.WebApp
                && Telegram.WebApp.initDataUnsafe
                && Telegram.WebApp.initDataUnsafe.user
                && Telegram.WebApp.initDataUnsafe.user.id;
            const adminParam = new URLSearchParams(window.location.search).get("admin") || "—";
            el.textContent = `v=139 · ${IS_ADMIN ? "ADMIN" : "user"} · id=${id || "—"} · q=${adminParam}`;
        }
    } catch (e) {}
}

// ========== STATE ==========

let state = loadState();

function defaultState() {
    return {
        tickets: USER_MAX_TICKETS,
        lastTicketTime: Date.now(),
        lastRefillStamp: null,
        // Window-based bonus lockout. After claiming a bonus the player is
        // locked out (no coupons, no further claim) until the start of the
        // next window. Two windows per month: days 1–14 and 15–end.
        // lockedUntilWindow stores the window key in which the claim happened.
        lockedUntilWindow: null,
        // Window key when the current build started filling. If we cross a
        // boundary with a half-built or completed build, on next open the
        // game will auto-claim (if complete) or silently drop progress.
        buildWindowKey: null,
        // Last bonus window we saw the player in. When this stops matching
        // currentWindowKey() we wipe any unspent accumulated tickets.
        lastSeenWindow: null,
        // One-shot migration flags. Used to fix locks left behind by the
        // pre-v113 inline-button bug where claims never reached the bot.
        migratedV113: false,
        // Last consumed bot grant signature ("YYYY-MM-DD:N") so we credit
        // each ?bonus_tickets= payload at most once.
        lastClubPlayGrant: null,
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
            // Backfill missing build slots (e.g. slot was added in a later version)
            for (const slot of Object.keys(def.currentBuild)) {
                if (!(slot in loaded.currentBuild)) loaded.currentBuild[slot] = null;
            }
            // Drop obsolete build slots (e.g. a slot was removed in a later
            // version) so Object.values(currentBuild) doesn't count them in
            // isBuildComplete
            for (const slot of Object.keys(loaded.currentBuild)) {
                if (!(slot in def.currentBuild)) delete loaded.currentBuild[slot];
            }
            // Drop obsolete items from inventory so tabs for removed categories
            // disappear and storage doesn't accumulate dead stuff
            loaded.inventory = (loaded.inventory || []).filter(
                item => item && item.category in CATEGORIES
            );
            return loaded;
        }
    } catch(e) {}
    return defaultState();
}

function saveState() {
    localStorage.setItem("reborn_pc_game_v2", JSON.stringify(state));
}

// ========== WINDOWS (bonus payout periods) ==========
// Two windows per calendar month: 1–14 (h1) and 15–end (h2). A bonus claim
// locks the player for the rest of their current window. At 00:00 МСК on
// day 15 (and 1st of next month) the lockout is lifted automatically.
const WINDOW_BOUNDARY_DAY = 15;

function _mskNow() { return new Date(Date.now() + 3 * 3600 * 1000); }

function currentWindowKey() {
    const msk = _mskNow();
    const y = msk.getUTCFullYear();
    const m = String(msk.getUTCMonth() + 1).padStart(2, "0");
    const half = msk.getUTCDate() < WINDOW_BOUNDARY_DAY ? "h1" : "h2";
    return `${y}-${m}-${half}`;
}

function nextWindowStartMs() {
    const msk = _mskNow();
    let target;
    if (msk.getUTCDate() < WINDOW_BOUNDARY_DAY) {
        target = new Date(Date.UTC(msk.getUTCFullYear(), msk.getUTCMonth(), WINDOW_BOUNDARY_DAY));
    } else {
        target = new Date(Date.UTC(msk.getUTCFullYear(), msk.getUTCMonth() + 1, 1));
    }
    return target.getTime() - 3 * 3600 * 1000; // back to actual UTC ms
}

function isLocked() {
    if (IS_ADMIN) return false;
    return state.lockedUntilWindow && state.lockedUntilWindow === currentWindowKey();
}

function fmtRemainingShort(ms) {
    if (ms <= 0) return "сейчас";
    const days = Math.floor(ms / 86400000);
    const hrs  = Math.floor((ms % 86400000) / 3600000);
    const min  = Math.floor((ms % 3600000) / 60000);
    if (days > 0) return `${days}д ${hrs}ч`;
    if (hrs > 0)  return `${hrs}ч ${min.toString().padStart(2,"0")}м`;
    return `${min}м`;
}

// ========== TICKETS ==========
// Non-admins get 5 tickets refilled at once at 12:00 МСК (UTC+3) every day.
// Admins are pinned to ADMIN_MAX_TICKETS at all times.
const REFILL_HOUR_MSK = 12;

// Returns the YYYY-MM-DD label of the most recent 12:00 МСК that has already
// passed. Used as a per-day stamp so we refill exactly once per cycle.
function currentRefillStamp() {
    const msk = new Date(Date.now() + 3 * 3600 * 1000); // shift to UTC+3
    if (msk.getUTCHours() < REFILL_HOUR_MSK) {
        msk.setUTCDate(msk.getUTCDate() - 1);
    }
    const y = msk.getUTCFullYear();
    const m = String(msk.getUTCMonth() + 1).padStart(2, "0");
    const d = String(msk.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

// Real ms left until the next 12:00 МСК.
function msUntilNextRefill() {
    const now = Date.now();
    const msk = new Date(now + 3 * 3600 * 1000);
    const target = new Date(msk);
    target.setUTCHours(REFILL_HOUR_MSK, 0, 0, 0);
    if (msk >= target) target.setUTCDate(target.getUTCDate() + 1);
    return target.getTime() - msk.getTime();
}

function regenTickets() {
    if (IS_ADMIN) {
        if (state.tickets < ADMIN_MAX_TICKETS) {
            state.tickets = ADMIN_MAX_TICKETS;
            saveState();
        }
        state.lastTicketTime = Date.now();
        return;
    }
    if (isLocked()) {
        // No coupons during the lockout — they only flow again after the
        // window boundary at 00:00 МСК.
        return;
    }
    // Wipe accumulated tickets at every bonus-window boundary (15-th / 1-st
    // 00:00 МСК). Whatever the player didn't spend is gone — fresh start.
    // Skip the wipe on first ever load (lastSeenWindow == null) so existing
    // players don't lose their tickets when this version rolls out.
    const cwk = currentWindowKey();
    if (state.lastSeenWindow == null) {
        state.lastSeenWindow = cwk;
        saveState();
    } else if (state.lastSeenWindow !== cwk) {
        state.lastSeenWindow = cwk;
        state.tickets = 0;
        state.lastRefillStamp = null; // force a fresh refill below
        saveState();
    }
    // Daily refill: accumulate +5 per missed day, capped at USER_TICKET_CAP.
    const stamp = currentRefillStamp();
    if (state.lastRefillStamp !== stamp) {
        state.tickets = Math.min(USER_TICKET_CAP, (state.tickets || 0) + USER_MAX_TICKETS);
        state.lastRefillStamp = stamp;
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
    const locked = isLocked();

    dropSub.textContent = locked
        ? "🔒 Жди разблокировки"
        : `🎫 ${state.tickets} попыт${state.tickets === 1 ? "ка" : "ки"}`;
    dropBtn.disabled = locked || state.tickets <= 0;

    if (IS_ADMIN) {
        el.textContent = "Все попытки доступны!";
        return;
    }
    if (locked) {
        const remain = nextWindowStartMs() - Date.now();
        el.textContent = `🔒 Бонус получен. Следующее окно через ${fmtRemainingShort(remain)}`;
        return;
    }
    const remaining = msUntilNextRefill();
    const hrs = Math.floor(remaining / 3600000);
    const min = Math.floor((remaining % 3600000) / 60000);
    el.textContent = `+5 в 12:00 МСК · через ${hrs}ч ${min.toString().padStart(2,"0")}м · до ${USER_TICKET_CAP}`;
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
    if (IS_ADMIN) state.tickets = ADMIN_MAX_TICKETS;
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

function assembleBuild(opts) {
    opts = opts || {};
    const auto = !!opts.auto;
    if (!isBuildComplete()) return;
    if (!auto && isLocked()) return;

    const power = getBuildPower();
    const tier = getBuildTier(power);
    state.bonusPoints += tier.bonus;
    state.buildsHistory.unshift({
        date: new Date().toLocaleDateString("ru"),
        tier: tier.name, stars: tier.stars, power, bonus: tier.bonus
    });

    const buildSnapshot = {};
    for (const slot of Object.keys(state.currentBuild)) {
        const c = state.currentBuild[slot];
        if (c) buildSnapshot[slot] = {
            model: c.model, rarity: c.rarity, power: c.power
        };
    }

    // Lock out non-admins for the rest of this window (auto-claims that fire
    // on a fresh window are still locked into THAT window so the player can't
    // double-dip in the same period).
    if (!IS_ADMIN) {
        state.lockedUntilWindow = currentWindowKey();
    }

    // Wipe everything tied to the current cycle: build slots + warehouse
    // inventory. Player starts the next cycle from scratch.
    for (const slot of Object.keys(state.currentBuild)) {
        state.currentBuild[slot] = null;
    }
    state.inventory = [];
    state.buildWindowKey = null;
    saveState();

    // Tell the bot every tier triggers a real bonus credit. The bot decides
    // the exact ruble amount (server is the source of truth), and the `auto`
    // flag changes the wording of the confirmation message.
    const payload = JSON.stringify({
        event: "build_assembled",
        tier: tier.name,
        stars: tier.stars,
        bonus: tier.bonus,
        power: power,
        build: buildSnapshot,
        auto: auto,
        ts: Date.now()
    });
    const tg = window.Telegram && window.Telegram.WebApp;
    const hasSend = tg && typeof tg.sendData === "function";

    function fireSend() {
        if (!hasSend) {
            alert("⚠️ Telegram.WebApp.sendData недоступен.\n\n" +
                "Открой игру через нижнюю reply-кнопку «🎲 Мини-игра» " +
                "(после /start она закреплена внизу чата).");
            return;
        }
        try {
            tg.sendData(payload);
            // sendData should immediately close the WebApp on success. If
            // we're still alive a second later, Telegram silently dropped
            // the call (typical for Menu-Button launches) — warn the user.
            setTimeout(() => {
                alert(
                    "⚠️ Бонус не отправился боту.\n\n" +
                    "Скорее всего ты открыл игру не через нужную точку входа. " +
                    "Закрой игру → в чате с ботом тапни «🎲 Мини-игра» " +
                    "на нижней клавиатуре (если её нет — отправь /start). " +
                    "Только из неё бонусы реально начисляются."
                );
            }, 1500);
        } catch (e) {
            alert("sendData упал с ошибкой: " + e.message);
        }
    }

    fireSend();
    return tier;
}

// Stamp the current window onto the build the moment any slot is filled,
// so init() can detect a window crossover and auto-claim if needed. Idempotent —
// called from renderCase() which runs after every meaningful state change.
function trackBuildStart() {
    if (IS_ADMIN || state.buildWindowKey) return;
    const filled = Object.values(state.currentBuild || {}).some(c => c);
    if (filled) {
        state.buildWindowKey = currentWindowKey();
        saveState();
    }
}

// ========== UI: CASE RENDERING ==========

function renderCase() {
    trackBuildStart();
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
        const cards = slotOrder.map(slot => {
            const comp = state.currentBuild[slot];

            if (comp) {
                filledCount++;
                const rar = RARITIES[comp.rarity];
                return `
                    <div class="comp-slot filled ${comp.rarity}" data-slot="${slot}" style="--slot-color:${rar.color}">
                        <div class="comp-slot-name">${SLOT_LABELS[slot]}</div>
                        <div class="comp-slot-value">⚡${comp.power}</div>
                    </div>`;
            }
            return `
                <div class="comp-slot empty" data-slot="${slot}">
                    <div class="comp-slot-name">${SLOT_LABELS[slot]}</div>
                    <div class="comp-slot-value">пусто</div>
                </div>`;
        });
        grid.innerHTML = cards.join("");
    }

    const buildSummary = document.getElementById("build-summary");
    const buildSummaryTitle = document.getElementById("build-summary-title");
    const buildSummaryPower = document.getElementById("build-summary-power");
    if (buildSummary && buildSummaryTitle && buildSummaryPower) {
        buildSummaryTitle.textContent = `Сборка ${filledCount}/6`;
        buildSummaryPower.textContent = `⚡${power}`;
        buildSummary.classList.toggle("complete", isBuildComplete());
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

    // Assemble button — disabled if build incomplete OR player locked for this window
    const assembleBtn = document.getElementById("btn-assemble");
    assembleBtn.disabled = !isBuildComplete() || isLocked();
    const assembleLabel = assembleBtn.querySelector(".assemble-label") || assembleBtn.querySelector("span");
    if (assembleLabel) {
        assembleLabel.textContent = isBuildComplete()
            ? "Собрать ПК"
            : `Собрать · ${filledCount}/6`;
    }

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

    // Component display: big PNG of the actual part (fallback to emoji)
    const compEl = document.getElementById("drop-component");
    const iconEl = document.getElementById("drop-comp-icon");
    compEl.style.borderColor = rar.color;
    iconEl.textContent = cat.icon;
    // Strip any old image
    const oldImg = compEl.querySelector("img.drop-comp-img");
    if (oldImg) oldImg.remove();
    // Try the part PNG; if it loads, swap from emoji to image
    const rarityNum = { common: 1, rare: 2, epic: 3, legendary: 4 }[comp.rarity];
    const partImg = document.createElement("img");
    partImg.className = "drop-comp-img";
    partImg.style.cssText = "max-width:100%;max-height:100%;object-fit:contain;display:none";
    partImg.onload = () => {
        partImg.style.display = "block";
        iconEl.style.display = "none";
    };
    partImg.onerror = () => {
        partImg.remove();
        iconEl.style.display = "block";
    };
    // preview-* is the source image cropped tightly to its opaque pixels —
    // shows the part big and centered in the card, not a tiny dot inside
    // a 1536x1024 transparent canvas
    partImg.src = "preview-" + comp.category + "-" + rarityNum + ".png";
    compEl.appendChild(partImg);

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

        if (isUpgrade) {
            // Auto-equip + fly to its slot in the case
            state.currentBuild[comp.category] = comp;
            saveState();
            flyComponentToSlot(comp, cat);
        } else {
            // Weaker than current OR duplicate — fly to inventory tab,
            // do NOT replace what's already in the case
            saveState();
            flyComponentToInventory(comp, cat);
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

// Compute where a category's part actually shows up on screen, accounting
// for the bg's object-fit:cover (which scales the natural 1536x1024 to
// FILL the container, cropping the overflow) and object-position:center 20%
// (which biases the visible window toward the top half).
function getPartScreenPosition(category) {
    const bg = document.getElementById("pc-bg-image");
    const slot = SLOT_POSITIONS[category];
    if (!bg) return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const r = bg.getBoundingClientRect();
    const natW = bg.naturalWidth || 1536;
    const natH = bg.naturalHeight || 1024;
    if (!slot) return { x: r.left + r.width / 2, y: r.top + r.height / 2 };

    // object-fit: cover — image is scaled by max ratio so it fills both axes
    const scale = Math.max(r.width / natW, r.height / natH);
    const dispW = natW * scale;
    const dispH = natH * scale;

    // object-position from style.css: "center 20%"
    // Formula per CSS spec: offset = (container - displayed) * percentage / 100
    const offsetX = (r.width - dispW) * 0.5;
    const offsetY = (r.height - dispH) * 0.2;

    // Part's center in natural pixels (from SLOT_POSITIONS percentages)
    const partX = natW * slot.xp / 100;
    const partY = natH * slot.yp / 100;

    return {
        x: r.left + offsetX + partX * scale,
        y: r.top + offsetY + partY * scale,
    };
}

// Fly the part image from the drop modal into the case slot, rotating
// in flight. Use this when the dropped part actually goes INTO the case
// (i.e. it's an upgrade that auto-equips).
function flyComponentToSlot(comp, cat) {
    const flyEl = document.getElementById("flying-comp");
    const FLY_SIZE = 180;     // start size (px)
    const LAND_SIZE = 60;     // end size (px) — roughly comp-grid slot icon
    const SCALE_END = LAND_SIZE / FLY_SIZE;
    const FLIGHT_MS = 1200;
    const ROT_DEG = 720;      // two full spins

    // ---- start position: where the part is shown in the drop modal ----
    const sourceEl = document.getElementById("drop-component");
    let startCX, startCY;
    if (sourceEl && sourceEl.offsetParent !== null) {
        const r = sourceEl.getBoundingClientRect();
        startCX = r.left + r.width / 2;
        startCY = r.top + r.height / 2;
    } else {
        startCX = window.innerWidth / 2;
        startCY = window.innerHeight / 2;
    }

    // ---- target position: actual slot on the case where the part sits ----
    // The bg uses object-fit:cover + object-position:center 20%, so
    // SLOT_POSITIONS percentages (which are positions within the natural
    // 1536x1024 image) DON'T map directly to the container rect — we have
    // to compute where the cover-scaled image actually paints on screen.
    const target = getPartScreenPosition(comp.category);
    let targetCX = target.x, targetCY = target.y;

    // ---- render the actual part PNG inside the flying element ----
    // Use preview-* (cropped) so the spinning icon shows the full part,
    // not a tiny dot lost in a 1536x1024 transparent canvas
    const rarityNum = { common: 1, rare: 2, epic: 3, legendary: 4 }[comp.rarity];
    const imgSrc = "preview-" + comp.category + "-" + rarityNum + ".png";
    flyEl.innerHTML = '<img src="' + imgSrc +
        '" style="width:100%;height:100%;object-fit:contain;display:block;"' +
        ' onerror="this.outerHTML=\'<span style=\\\'font-size:120px;line-height:' +
        FLY_SIZE + 'px\\\'>' + cat.icon + '</span>\'">';

    // ---- snap to start, no transition ----
    flyEl.style.transition = "none";
    flyEl.style.left = (startCX - FLY_SIZE / 2) + "px";
    flyEl.style.top = (startCY - FLY_SIZE / 2) + "px";
    flyEl.style.transform = "scale(1) rotate(0deg)";
    flyEl.style.opacity = "1";
    flyEl.classList.remove("hidden");

    // Force layout flush so the no-transition placement applies
    void flyEl.offsetWidth;

    // ---- animate to target ----
    requestAnimationFrame(() => {
        flyEl.style.transition =
            "left " + FLIGHT_MS + "ms cubic-bezier(0.45, 0.05, 0.55, 0.95), " +
            "top " + FLIGHT_MS + "ms cubic-bezier(0.55, -0.2, 0.4, 1.2), " +
            "transform " + FLIGHT_MS + "ms cubic-bezier(0.4, 0, 0.2, 1), " +
            "opacity " + (FLIGHT_MS - 100) + "ms ease-in";

        flyEl.style.left = (targetCX - FLY_SIZE / 2) + "px";
        flyEl.style.top = (targetCY - FLY_SIZE / 2) + "px";
        flyEl.style.transform = "scale(" + SCALE_END + ") rotate(" + ROT_DEG + "deg)";
        flyEl.style.opacity = "0.9";

        setTimeout(() => {
            flyEl.classList.add("hidden");
            flyEl.style.transition = "none";
            flyEl.innerHTML = "";

            // Re-render: updates case overlays (the part appears at the same
            // pixel position the flight ended at) and comp-grid slot icons.
            renderCase();

            // Brief flash glow on the case overlay where the part landed
            const overlay = document.getElementById("pc-" + comp.category + "-image");
            if (overlay && overlay.style.display !== "none") {
                overlay.classList.add("just-landed");
                setTimeout(() => overlay.classList.remove("just-landed"), 700);
            }
        }, FLIGHT_MS + 30);
    });
}

// Fly the part image from the drop modal to the inventory tab button.
// Used when the dropped part is NOT an upgrade — it just sits in storage,
// so the visual feedback is "here's where you'll find it" instead of
// "watch it appear in the case".
function flyComponentToInventory(comp, cat) {
    const flyEl = document.getElementById("flying-comp");
    const FLY_SIZE = 180;
    const LAND_SIZE = 50;
    const SCALE_END = LAND_SIZE / FLY_SIZE;
    const FLIGHT_MS = 1100;
    const ROT_DEG = 540;  // 1.5 spins — slightly less than upgrade flight

    // Source: drop modal component
    const sourceEl = document.getElementById("drop-component");
    let startCX, startCY;
    if (sourceEl && sourceEl.offsetParent !== null) {
        const r = sourceEl.getBoundingClientRect();
        startCX = r.left + r.width / 2;
        startCY = r.top + r.height / 2;
    } else {
        startCX = window.innerWidth / 2;
        startCY = window.innerHeight / 2;
    }

    // Target: the inventory tab button
    const tabBtn = document.querySelector('.btab[data-tab="inventory"]');
    let targetCX, targetCY;
    if (tabBtn) {
        const r = tabBtn.getBoundingClientRect();
        targetCX = r.left + r.width / 2;
        targetCY = r.top + r.height / 2;
    } else {
        targetCX = window.innerWidth / 2;
        targetCY = window.innerHeight - 40;
    }

    // Render the actual part PNG inside the flying element
    const rarityNum = { common: 1, rare: 2, epic: 3, legendary: 4 }[comp.rarity];
    const imgSrc = "preview-" + comp.category + "-" + rarityNum + ".png";
    flyEl.innerHTML = '<img src="' + imgSrc +
        '" style="width:100%;height:100%;object-fit:contain;display:block;"' +
        ' onerror="this.outerHTML=\'<span style=\\\'font-size:120px;line-height:' +
        FLY_SIZE + 'px\\\'>' + cat.icon + '</span>\'">';

    flyEl.style.transition = "none";
    flyEl.style.left = (startCX - FLY_SIZE / 2) + "px";
    flyEl.style.top = (startCY - FLY_SIZE / 2) + "px";
    flyEl.style.transform = "scale(1) rotate(0deg)";
    flyEl.style.opacity = "1";
    flyEl.classList.remove("hidden");
    void flyEl.offsetWidth;

    requestAnimationFrame(() => {
        flyEl.style.transition =
            "left " + FLIGHT_MS + "ms cubic-bezier(0.45, 0.05, 0.55, 0.95), " +
            "top " + FLIGHT_MS + "ms cubic-bezier(0.55, -0.2, 0.4, 1.2), " +
            "transform " + FLIGHT_MS + "ms cubic-bezier(0.4, 0, 0.2, 1), " +
            "opacity " + (FLIGHT_MS - 100) + "ms ease-in";
        flyEl.style.left = (targetCX - FLY_SIZE / 2) + "px";
        flyEl.style.top = (targetCY - FLY_SIZE / 2) + "px";
        flyEl.style.transform = "scale(" + SCALE_END + ") rotate(" + ROT_DEG + "deg)";
        flyEl.style.opacity = "0.85";

        setTimeout(() => {
            flyEl.classList.add("hidden");
            flyEl.style.transition = "none";
            flyEl.innerHTML = "";

            // Pulse the inventory tab to confirm landing
            if (tabBtn) {
                tabBtn.classList.add("just-landed");
                setTimeout(() => tabBtn.classList.remove("just-landed"), 600);
            }
        }, FLIGHT_MS + 30);
    });
}

// Fly from inventory card to case slot — same animation as drop-flight but
// starting from the clicked card instead of the drop modal.
function flyFromCardToCase(cardEl, comp) {
    const cat = CATEGORIES[comp.category];
    flyComponentToSlot(comp, cat);
}

// ========== UI: TABS ==========

const mainView = document.querySelector(".case-container");
// Legacy action areas may be absent after the control deck redesign.
const actionAreas = document.querySelectorAll(".action-area");
const timerEl = document.querySelector(".ticket-timer");
const buildSheet = document.getElementById("build-sheet");
const buildSummary = document.getElementById("build-summary");
const buildSheetClose = document.getElementById("build-sheet-close");

function closeBuildSheet() {
    if (buildSheet) buildSheet.classList.add("hidden");
}

function openBuildSheet() {
    if (buildSheet) buildSheet.classList.remove("hidden");
}

document.querySelectorAll(".btab").forEach(tab => {
    tab.addEventListener("click", () => {
        closeBuildSheet();
        document.querySelectorAll(".btab").forEach(t => t.classList.remove("active"));
        document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
        tab.classList.add("active");

        const tabName = tab.dataset.tab;
        if (tabName === "main") {
            mainView.style.display = "";
            actionAreas.forEach(a => { a.style.display = ""; });
            timerEl.style.display = "";
        } else {
            mainView.style.display = "none";
            actionAreas.forEach(a => { a.style.display = "none"; });
            timerEl.style.display = "none";
            document.getElementById("page-" + tabName).classList.add("active");
            if (tabName === "inventory") renderInventory();
            if (tabName === "rating") renderRating();
        }
    });
});

if (buildSummary) {
    buildSummary.addEventListener("click", openBuildSheet);
}

if (buildSheetClose) {
    buildSheetClose.addEventListener("click", closeBuildSheet);
}

if (buildSheet) {
    buildSheet.addEventListener("click", (e) => {
        if (e.target === buildSheet) closeBuildSheet();
    });
}

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
    tabsEl.style.cssText = "display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px";
    const catKeys = Object.keys(CATEGORIES);
    tabsEl.innerHTML = catKeys.map(key => {
        const cat = CATEGORIES[key];
        const count = state.inventory.filter(i => i.category === key).length;
        const isActive = key === invActiveCategory;
        const bg = isActive ? "var(--accent)" : "var(--bg2)";
        const fg = isActive ? "#0a0a0a" : "#fff";
        const sub = isActive ? "rgba(0,0,0,0.55)" : "var(--text2)";
        const border = isActive ? "transparent" : "rgba(255,255,255,0.06)";
        return `
            <button class="invtab2 ${isActive ? 'invtab2-active' : ''}" data-cat="${key}"
                    style="background:${bg};color:${fg};border:1px solid ${border};border-radius:14px;padding:12px 8px;display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer;font-family:inherit;position:relative;min-height:78px">
                <span style="font-size:24px;line-height:1">${cat.icon}</span>
                <span style="font-size:12px;font-weight:700;line-height:1.1;text-align:center">${cat.name}</span>
                <span style="font-size:11px;color:${sub};font-weight:600">${count} шт.</span>
                ${count > 0 ? `<span style="position:absolute;top:6px;right:8px;background:${isActive ? '#0a0a0a' : 'var(--accent)'};color:${isActive ? 'var(--accent)' : '#0a0a0a'};font-size:10px;font-weight:800;padding:2px 6px;border-radius:8px;min-width:18px;text-align:center">${count}</span>` : ''}
            </button>
        `;
    }).join("");

    tabsEl.querySelectorAll(".invtab2").forEach(btn => {
        btn.addEventListener("click", () => {
            invActiveCategory = btn.dataset.cat;
            renderInvTabs();
            renderInventoryList();
        });
    });
}

function renderInventoryList() {
    const list = document.getElementById("inventory-list");
    try {
        return _renderInventoryListImpl(list);
    } catch (e) {
        list.innerHTML = `<div style="padding:16px;color:#f87171;font-size:13px">⚠️ Ошибка отрисовки: ${(e && e.message) || e}</div>`;
        console.error("renderInventoryList:", e);
    }
}

function _renderInventoryListImpl(list) {
    const items = state.inventory.filter(i => i.category === invActiveCategory);
    const rarOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
    items.sort((a, b) => rarOrder[a.rarity] - rarOrder[b.rarity] || b.power - a.power);

    const cat = CATEGORIES[invActiveCategory];
    const current = state.currentBuild[invActiveCategory];

    if (!items.length) {
        list.innerHTML = `
            <div style="text-align:center;padding:40px 20px;border:2px dashed rgba(255,255,255,0.08);border-radius:14px;margin-top:8px">
                <div style="font-size:48px;margin-bottom:10px;opacity:.5">${cat.icon}</div>
                <div style="font-size:15px;font-weight:600;margin-bottom:6px">Нет деталей: ${cat.name}</div>
                <div style="font-size:12px;color:var(--text2)">Открой вкладку «🖥 Сборка» и тапай «📦 Выбить деталь», чтобы наполнить склад.</div>
            </div>
        `;
        return;
    }

    // Bigger, info-rich cards: rarity-colored border + filled rarity pill,
    // prominent model name, large power readout, clear "in build" badge.
    list.innerHTML = items.map(item => {
        // Defensive: legacy saves can carry rarities (e.g. "uncommon") that
        // the current RARITIES table no longer defines. Fall back so the
        // whole list doesn't blow up on a single bad item.
        const rar = RARITIES[item.rarity] || RARITIES.common;
        const inBuild = current && current.id === item.id;
        const cardBg = inBuild
            ? `linear-gradient(135deg, ${rar.color}33, var(--bg2))`
            : item.rarity === "legendary"
                ? "linear-gradient(135deg, #1a1000, var(--bg2))"
                : "var(--bg2)";
        return `
            <div class="invcard2 ${inBuild ? 'invcard2-eq' : ''}" data-item-id="${item.id}"
                 style="background:${cardBg};border-radius:16px;border:2px solid ${rar.color};padding:16px;display:flex;align-items:center;gap:14px;cursor:${inBuild ? 'default' : 'pointer'};margin:8px 0;box-shadow:0 2px 12px ${rar.color}22">
                <div style="font-size:42px;min-width:60px;height:60px;display:flex;align-items:center;justify-content:center;background:${rar.color}22;border-radius:12px;border:1px solid ${rar.color}55">
                    ${cat.icon}
                </div>
                <div style="flex:1;min-width:0">
                    <div style="font-size:16px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:8px">${item.model}</div>
                    <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
                        <span style="font-size:11px;font-weight:700;padding:3px 10px;border-radius:10px;background:${rar.color};color:#000;text-transform:uppercase;letter-spacing:.3px">${rar.name}</span>
                        ${inBuild ? `<span style="font-size:11px;font-weight:700;padding:3px 10px;border-radius:10px;background:#22c55e;color:#000">🖥 В СБОРКЕ</span>` : ""}
                    </div>
                </div>
                <div style="text-align:center;min-width:62px;padding-left:6px;border-left:1px solid rgba(255,255,255,0.08)">
                    <div style="font-size:22px;font-weight:900;color:${rar.color};line-height:1">${item.power}</div>
                    <div style="font-size:10px;color:var(--text2);margin-top:4px;text-transform:uppercase;letter-spacing:.5px">⚡ мощн.</div>
                </div>
            </div>
        `;
    }).join("");

    // Click to equip
    list.querySelectorAll(".invcard2:not(.invcard2-eq)").forEach(el => {
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

function renderAdminPanel() {
    const list = document.getElementById("inventory-list");
    if (!list || !IS_ADMIN) return;
    const slot = document.getElementById("inv-admin-row") || (() => {
        const d = document.createElement("div");
        d.id = "inv-admin-row";
        d.style.cssText =
            "display:flex;gap:8px;flex-wrap:wrap;padding:10px 12px;" +
            "border:1px dashed #f59e0b;border-radius:10px;margin-bottom:10px;" +
            "background:rgba(245,158,11,0.06);font-size:13px";
        list.parentElement.insertBefore(d, list);
        return d;
    })();
    slot.innerHTML = `
        <span style="color:#f59e0b;font-weight:600;align-self:center">🛠 Admin</span>
        <button id="admin-clear-inv" style="padding:6px 10px;border-radius:8px;border:1px solid #ef4444;background:transparent;color:#ef4444;cursor:pointer">🗑 Очистить детали</button>
        <button id="admin-clear-lock" style="padding:6px 10px;border-radius:8px;border:1px solid #f59e0b;background:transparent;color:#f59e0b;cursor:pointer">🔓 Снять блокировку</button>
        <button id="admin-full-reset" style="padding:6px 10px;border-radius:8px;border:1px solid #94a3b8;background:transparent;color:#94a3b8;cursor:pointer">💯 Полный сброс</button>
    `;
    document.getElementById("admin-clear-inv").onclick = () => {
        if (!confirm("Удалить все детали из инвентаря и обнулить сборку?")) return;
        state.inventory = [];
        for (const k of Object.keys(state.currentBuild)) state.currentBuild[k] = null;
        state.buildWindowKey = null;
        saveState();
        renderCase();
        renderInventory();
    };
    document.getElementById("admin-clear-lock").onclick = () => {
        state.lockedUntilWindow = null;
        saveState();
        updateTicketTimer();
        renderCase();
    };
    document.getElementById("admin-full-reset").onclick = () => {
        if (!confirm("Полный сброс прогресса (включая историю сборок)?")) return;
        resetAll();
        renderInventory();
    };
}

function renderInventory() {
    renderInvTabs();
    renderInventoryList();
    renderAdminPanel();
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

async function fetchRanking() {
    try {
        const res = await fetch("./ranking.json?ts=" + Date.now(), { cache: "no-store" });
        if (!res.ok) return null;
        return await res.json();
    } catch (e) {
        return null;
    }
}

function _myTgId() {
    try {
        return (window.Telegram && Telegram.WebApp
            && Telegram.WebApp.initDataUnsafe
            && Telegram.WebApp.initDataUnsafe.user
            && Telegram.WebApp.initDataUnsafe.user.id) || null;
    } catch (e) { return null; }
}

async function renderRating() {
    const tiersEl = document.getElementById("rating-tiers");
    tiersEl.innerHTML = `<div class="rating-loading" style="padding:12px;color:var(--text2);text-align:center">Загружаю рейтинг…</div>`;

    const data = await fetchRanking();
    const myId = _myTgId();
    const players = (data && Array.isArray(data.players)) ? data.players : [];

    if (!players.length) {
        tiersEl.innerHTML = `
            <div class="history-title" style="text-align:center;padding:14px">
                🏆 Рейтинг игроков
            </div>
            <div class="history-empty" style="text-align:center;padding:14px;color:var(--text2)">
                Пока никто не получил бонус. Будь первым!
            </div>
        `;
    } else {
        const medal = (r) => r === 1 ? "🥇" : r === 2 ? "🥈" : r === 3 ? "🥉" : `<span style="opacity:.6">#${r}</span>`;
        const top = players.slice(0, 50);
        let html = `<div class="history-title" style="padding:10px 12px;font-weight:700">🏆 Топ игроков по бонусам</div>`;
        html += top.map(p => {
            const isMe = myId && p.tg === myId;
            const bg = isMe ? "background:rgba(245,158,11,0.15);border:1px solid #f59e0b" : "";
            return `
                <div class="history-item" style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px;border-radius:10px;margin:4px 0;${bg}">
                    <div style="display:flex;gap:10px;align-items:center">
                        <div style="font-size:16px;min-width:34px;text-align:center">${medal(p.rank)}</div>
                        <div>
                            <div style="font-weight:600">${p.name}${isMe ? " <span style=\"color:#f59e0b\">(ты)</span>" : ""}</div>
                            <div style="font-size:11px;color:var(--text2)">${p.builds} сборок</div>
                        </div>
                    </div>
                    <div style="text-align:right">
                        <div style="color:var(--green);font-weight:700">+${p.total.toLocaleString("ru")} ₽</div>
                    </div>
                </div>
            `;
        }).join("");
        if (data && data.generated_at) {
            const ts = new Date(data.generated_at);
            html += `<div style="text-align:center;color:var(--text2);font-size:11px;margin-top:6px">Обновлено: ${ts.toLocaleString("ru")}</div>`;
        }
        tiersEl.innerHTML = html;
    }

    const histEl = document.getElementById("builds-history");
    const builds = state.buildsHistory || [];
    if (!builds.length) {
        histEl.innerHTML = `
            <div class="history-title" style="margin-top:14px">📜 Твои сборки</div>
            <div class="history-empty">Ещё ни одной — собирай!</div>
        `;
        return;
    }

    // Aggregate by tier so the player gets a quick at-a-glance summary
    // without scrolling — full chronological list moves into a collapsible.
    const tierEmojis = { 1: "🖨", 2: "🏠", 3: "🎮", 4: "🔥", 5: "👑" };
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const sums = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalBonus = 0;
    let maxStars = 0;
    for (const b of builds) {
        const s = b.stars || 1;
        counts[s] = (counts[s] || 0) + 1;
        sums[s] = (sums[s] || 0) + (b.bonus || 0);
        totalBonus += b.bonus || 0;
        if (s > maxStars) maxStars = s;
    }

    let cards = "";
    for (const t of [5, 4, 3, 2, 1]) {
        const c = counts[t];
        if (!c) continue;
        const tier = BUILD_TIERS[t - 1];
        cards += `
            <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;background:rgba(255,255,255,0.04);margin:4px 0">
                <div style="font-size:22px;min-width:32px;text-align:center">${tierEmojis[t]}</div>
                <div style="flex:1">
                    <div style="font-weight:600">${tier.name} <span style="opacity:.6">${"⭐".repeat(t)}</span></div>
                    <div style="font-size:11px;color:var(--text2)">собрано ${c} раз${c === 1 ? "" : c < 5 ? "а" : ""}</div>
                </div>
                <div style="text-align:right;color:var(--green);font-weight:700">+${sums[t].toLocaleString("ru")} ₽</div>
            </div>
        `;
    }

    const recent = builds.slice(0, 30);
    histEl.innerHTML = `
        <div class="history-title" style="margin-top:14px;display:flex;justify-content:space-between;align-items:center">
            <span>📜 Твои сборки</span>
            <span style="font-size:12px;color:var(--text2)">всего ${builds.length} · +${totalBonus.toLocaleString("ru")} ₽</span>
        </div>
        ${cards}
        <details style="margin-top:8px">
            <summary style="cursor:pointer;padding:8px 12px;font-size:13px;color:var(--text2);border-radius:8px;background:rgba(255,255,255,0.03)">
                📅 Хронология (последние ${recent.length})
            </summary>
            <div style="margin-top:6px">
                ${recent.map(b => `
                    <div class="history-item" style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;border-radius:8px;margin:3px 0;font-size:12px">
                        <div>
                            <span style="font-weight:600">${b.tier}</span>
                            <span style="opacity:.5"> · ${b.date}</span>
                        </div>
                        <div style="color:var(--green);font-weight:600">+${b.bonus} ₽</div>
                    </div>
                `).join("")}
            </div>
        </details>
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
    state.tickets = IS_ADMIN ? ADMIN_MAX_TICKETS : USER_MAX_TICKETS;
    saveState();
    renderCase();
    updateTicketTimer();
}

function init() {
    applyTier();

    // Clamp any oversaved tickets from before the cap was introduced
    if (!IS_ADMIN && state.tickets > MAX_TICKETS) {
        state.tickets = MAX_TICKETS;
        saveState();
    }

    // Until the claim flow is fully proven on the user's device we keep
    // clearing phantom lockouts on every load — claims that the bot's
    // bot_award_log can confirm will be added back via a future server
    // sync. For now the safer default is "always playable".
    if (state.lockedUntilWindow) {
        state.lockedUntilWindow = null;
        state.lastRefillStamp = null; // force fresh ticket refill below
        saveState();
    }
    state.migratedV113 = true;

    // Consume bonus tickets the bot owes us for real club play. The bot
    // signs the URL with `bonus_tickets=N&grant_date=YYYY-MM-DD`; we apply
    // each (date, N) pair exactly once by remembering the last-credited
    // grant signature in localStorage.
    try {
        const params = new URLSearchParams(window.location.search);
        const bonus = parseInt(params.get("bonus_tickets") || "0", 10);
        const grantDate = params.get("grant_date");
        if (bonus > 0 && grantDate) {
            const grantKey = `${grantDate}:${bonus}`;
            if (state.lastClubPlayGrant !== grantKey && !IS_ADMIN) {
                state.tickets = (state.tickets || 0) + bonus;
                state.lastClubPlayGrant = grantKey;
                saveState();
                setTimeout(() => {
                    alert(`🎮 +${bonus} купон(а) за игру в клубе сегодня!\nЗаработано в реальной игре, можно тратить тут.`);
                }, 400);
            }
        }
    } catch (e) {}

    if (!IS_ADMIN) {
        const cwk = currentWindowKey();
        // Naturally lift a stale lockout once we cross the window boundary.
        if (state.lockedUntilWindow && state.lockedUntilWindow !== cwk) {
            state.lockedUntilWindow = null;
            saveState();
        }
        // Track when the current build started — populate lazily so older
        // saves don't confuse the boundary-cross logic below.
        if (state.buildWindowKey == null) {
            const filledNow = Object.values(state.currentBuild || {}).some(c => c);
            if (filledNow) {
                state.buildWindowKey = cwk;
                saveState();
            }
        }
        // If the build started in a previous window, the player either
        // forgot to claim (auto-claim now) or never finished it (drop progress).
        if (state.buildWindowKey && state.buildWindowKey !== cwk) {
            if (isBuildComplete()) {
                // assembleBuild({auto:true}) will:
                //   - send sendData with auto:true so the bot replies with the
                //     "you forgot, I credited it for you" message,
                //   - lock the player into the current window,
                //   - reset the build.
                assembleBuild({ auto: true });
                // sendData closes the WebApp; nothing more to do here.
                return;
            }
            // Incomplete build — quietly drop the progress and start fresh.
            for (const slot of Object.keys(state.currentBuild)) {
                state.currentBuild[slot] = null;
            }
            state.buildWindowKey = null;
            saveState();
        }
    }

    regenTickets();

    if (IS_ADMIN) {
        state.tickets = ADMIN_MAX_TICKETS;
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
