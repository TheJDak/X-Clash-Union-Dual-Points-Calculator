/* =========================
   DATA (from your Excel "points table")
   - Base points are BEFORE buffs.
   - "usage" is the quantity embedded in the action (used to compute points-per-unit).
   - buff is either "n/a" or the research node name.
========================= */

const ACTIONS = [
  // Monday
  { day: "Monday", action: "Spend 660 Hero EXP", basePoints: 1, buff: "n/a", usage: 660 },
  { day: "Monday", action: "Spend 1 Stamina", basePoints: 150, buff: "n/a", usage: 1 },
  { day: "Monday", action: "Complete 1 Intelligence Quest", basePoints: 10000, buff: "Intelligence Motivation", usage: 1 },
  { day: "Monday", action: "Spend 1 Mytstic Beast EXP", basePoints: 3, buff: "n/a", usage: 1 },
  { day: "Monday", action: "Use Mystic Beast Breakthrough Potion", basePoints: 2500, buff: "n/a", usage: 1 },
  { day: "Monday", action: "Gather 100 Food", basePoints: 20, buff: "n/a", usage: 100 },
  { day: "Monday", action: "Gather 100 Iron", basePoints: 20, buff: "n/a", usage: 100 },
  { day: "Monday", action: "Gather 60 Gold", basePoints: 20, buff: "n/a", usage: 60 },

  // Tuesday
  { day: "Tuesday", action: "Dispatch 1 Legendary Wagon", basePoints: 100000, buff: "n/a", usage: 1 },
  { day: "Tuesday", action: "Dispatch 1 Epic Wagon", basePoints: 40000, buff: "n/a", usage: 1 },
  { day: "Tuesday", action: "Dispatch 1 Rare Wagon", basePoints: 12000, buff: "n/a", usage: 1 },
  { day: "Tuesday", action: "Dispatch 1 Common Wagon", basePoints: 2000, buff: "n/a", usage: 1 },
  { day: "Tuesday", action: "Use 1 Mystery Hero Token", basePoints: 2000, buff: "Summoning Motivation", usage: 1 },
  { day: "Tuesday", action: "Use 1 Mystery Hero Token (10)", basePoints: 25000, buff: "Summoning Motivation", usage: 10 },

  // Wednesday
  { day: "Wednesday", action: "Use 1 Speedup Min", basePoints: 10, buff: "Accelerator Motivation", usage: 1 },
  { day: "Wednesday", action: "Use 1 Speedup Hour", basePoints: 600, buff: "Accelerator Motivation", usage: 1 },

  // Thursday
  { day: "Thursday", action: "Enemy Kill 1 Point", basePoints: 1, buff: "Enemy Kill Motivation", usage: 1 },

  // Friday
  { day: "Friday", action: "Complete 1 Research", basePoints: 100000, buff: "Research Motivation", usage: 1 },

  // Saturday
  { day: "Saturday", action: "Train 1 Soldier", basePoints: 2, buff: "Training Motivation", usage: 1 },

  // Sunday
  { day: "Sunday", action: "Increase Power 1 Point (Construction)", basePoints: 0.2, buff: "Construction Motivation", usage: 1 },
];

// Research nodes from your Excel "1. Research Center"
const RESEARCH_NODES = [
  { key: "All Points Increase", label: "All Points Increase" },
  { key: "Intelligence Motivation", label: "Intelligence Motivation" },
  { key: "Accelerator Motivation", label: "Accelerator Motivation" },
  { key: "Summoning Motivation", label: "Summoning Motivation" },
  { key: "Construction Motivation", label: "Construction Motivation" },
  { key: "Research Motivation", label: "Research Motivation" },
  { key: "Training Motivation", label: "Training Motivation" },
  { key: "Enemy Kill Motivation", label: "Enemy Kill Motivation" },
];

// Speedups UI (not tied to points)
const SPEEDUPS = [
  { key: "8h", label: "8H", minutes: 480 },
  { key: "3h", label: "3H", minutes: 180 },
  { key: "1h", label: "1H", minutes: 60 },
  { key: "15m", label: "15M", minutes: 15 },
  { key: "5m", label: "5M", minutes: 5 },
  { key: "1m", label: "1M", minutes: 1 },
];

// ---------- State ----------
const STORAGE_KEY = "union_dual_pro_state_v1";

const state = {
  tab: "calculator",
  day: "Monday",
  rounding: "none",

  // research levels (0..20+ is fine)
  research: Object.fromEntries(RESEARCH_NODES.map(n => [n.key, 0])),

  // per-action user entries
  // actionId -> { amount: number, mult: number }
  entries: {},

  // speedups counts
  speedups: Object.fromEntries(SPEEDUPS.map(s => [s.key, 0])),
};

function actionIdFor(a) {
  return `${a.day}__${a.action}`;
}

// ---------- Utilities ----------
function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function formatInt(n) {
  const x = Math.round(n);
  return x.toLocaleString();
}

function formatMaybeDecimal(n) {
  // points can be fractional, but UI should feel like the game: show whole numbers unless needed
  const isInt = Math.abs(n - Math.round(n)) < 1e-9;
  return (isInt ? Math.round(n) : Math.round(n * 10) / 10).toLocaleString();
}

function nowSavedText() {
  const d = new Date();
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" });
}

function applyRounding(value, mode) {
  if (mode === "floor") return Math.floor(value);
  if (mode === "ceil") return Math.ceil(value);
  if (mode === "nearest") return Math.round(value);
  return value;
}

function getBuffPct(nodeKey) {
  // Each level = +5%
  const level = Number(state.research[nodeKey] ?? 0);
  return level * 0.05;
}

function pointsPerUnit(actionRow) {
  const allPts = getBuffPct("All Points Increase");
  const nodeBuff = (actionRow.buff && actionRow.buff !== "n/a") ? getBuffPct(actionRow.buff) : 0;
  const adjusted = actionRow.basePoints * (1 + allPts + nodeBuff);
  return adjusted / actionRow.usage;
}

function calcActionPoints(actionRow) {
  const id = actionIdFor(actionRow);
  const entry = state.entries[id] ?? { amount: 0, mult: 1 };
  const amt = Number(entry.amount) || 0;
  const mult = Number(entry.mult) || 1;

  const raw = amt * pointsPerUnit(actionRow) * mult;
  return applyRounding(raw, state.rounding);
}

function calcTotalPoints() {
  const todays = ACTIONS.filter(a => a.day === state.day);
  const total = todays.reduce((sum, a) => sum + calcActionPoints(a), 0);
  return applyRounding(total, state.rounding);
}

// ---------- Save/Load ----------
function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  document.getElementById("savedText").textContent = `Saved ${nowSavedText()}`;
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);

    // shallow merge (keep any new defaults)
    if (parsed && typeof parsed === "object") {
      state.tab = parsed.tab ?? state.tab;
      state.day = parsed.day ?? state.day;
      state.rounding = parsed.rounding ?? state.rounding;

      state.research = { ...state.research, ...(parsed.research ?? {}) };
      state.entries = parsed.entries ?? {};
      state.speedups = { ...state.speedups, ...(parsed.speedups ?? {}) };
    }
  } catch {
    // ignore
  }
}

// ---------- Render ----------
function setTab(tab) {
  state.tab = tab;

  // panels
  document.getElementById("tab-calculator").classList.toggle("hidden", tab !== "calculator");
  document.getElementById("tab-research").classList.toggle("hidden", tab !== "research");
  document.getElementById("tab-speedups").classList.toggle("hidden", tab !== "speedups");

  // buttons + highlight
  const btns = [...document.querySelectorAll(".tabbtn")];
  btns.forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));

  const idx = Math.max(0, btns.findIndex(b => b.dataset.tab === tab));
  const highlight = document.getElementById("tabHighlight");
  highlight.style.transform = `translateX(${idx * 100}%)`;

  saveState();
}

function renderActions() {
  const list = document.getElementById("actionList");
  list.innerHTML = "";

  const todays = ACTIONS.filter(a => a.day === state.day);

  todays.forEach((a) => {
    const id = actionIdFor(a);
    const entry = state.entries[id] ?? { amount: "", mult: 1 };
    const pts = calcActionPoints(a);

    const card = document.createElement("div");
    card.className = "glass-card action-card";

    const hasTag = a.buff && a.buff !== "n/a";

    card.innerHTML = `
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <div class="font-extrabold text-[15px] leading-snug">${a.action}</div>
          <div class="mt-2 flex flex-wrap items-center gap-2">
            <button class="pill" data-mult-btn="${id}">
              x${Number(entry.mult || 1).toFixed(2)} Mult
            </button>
            ${hasTag ? `<span class="pill tag">${a.buff.replace(" Motivation","")}</span>` : ""}
          </div>
        </div>

        <div class="text-right shrink-0">
          <div class="pointsText" id="pts_${cssSafe(id)}">${formatMaybeDecimal(pts)}</div>
          <div class="pointsLabel">Points</div>
        </div>
      </div>

      <input
        class="amount"
        inputmode="decimal"
        placeholder="Enter amount..."
        value="${entry.amount ?? ""}"
        data-amount="${id}"
      />
    `;

    list.appendChild(card);
  });

  wireActionEvents();
  renderTotal();
}

function renderTotal() {
  document.getElementById("totalPoints").textContent = formatInt(calcTotalPoints());
}

function renderResearch() {
  const wrap = document.getElementById("researchList");
  wrap.innerHTML = "";

  RESEARCH_NODES.forEach((node) => {
    const lvl = Number(state.research[node.key] ?? 0);
    const pct = (lvl * 5);

    const row = document.createElement("div");
    row.className = "glass-card p-4 flex items-center justify-between gap-3";

    row.innerHTML = `
      <div class="min-w-0">
        <div class="font-extrabold">${node.label}</div>
        <div class="text-[12px] text-sky-300/90 font-bold">+${pct}% Bonus</div>
      </div>

      <select class="select w-[120px]" data-research="${node.key}">
        ${makeLevelOptions(lvl)}
      </select>
    `;

    wrap.appendChild(row);
  });
}

function makeLevelOptions(selected) {
  // sane range; you can extend later if needed
  const max = 30;
  let html = "";
  for (let i = 0; i <= max; i++) {
    const sel = (i === Number(selected)) ? "selected" : "";
    html += `<option value="${i}" ${sel}>Level ${i}</option>`;
  }
  return html;
}

function renderSpeedups() {
  const grid = document.getElementById("speedupsGrid");
  grid.innerHTML = "";

  SPEEDUPS.forEach((s) => {
    const val = Number(state.speedups[s.key] ?? 0);

    const box = document.createElement("div");
    box.className = "glass-card p-4";
    box.innerHTML = `
      <div class="label">${s.label}</div>
      <input class="amount !mt-0" inputmode="numeric" value="${val}" data-speedup="${s.key}" />
    `;
    grid.appendChild(box);
  });

  updateSpeedupTotals();
}

function updateSpeedupTotals() {
  let totalMin = 0;
  SPEEDUPS.forEach((s) => {
    const count = Number(state.speedups[s.key] ?? 0) || 0;
    totalMin += count * s.minutes;
  });

  document.getElementById("totalMinutes").textContent = formatInt(totalMin);
  document.getElementById("totalHours").textContent = `${(totalMin / 60).toFixed(1)}h`;
}

// ---------- Events ----------
function wireActionEvents() {
  // Amount inputs
  document.querySelectorAll("input[data-amount]").forEach((inp) => {
    inp.addEventListener("input", (e) => {
      const id = e.target.dataset.amount;
      const val = e.target.value;

      state.entries[id] = state.entries[id] ?? { amount: "", mult: 1 };
      state.entries[id].amount = val;

      // live update points + total
      const a = ACTIONS.find(x => actionIdFor(x) === id);
      if (a) {
        const pts = calcActionPoints(a);
        const el = document.getElementById(`pts_${cssSafe(id)}`);
        if (el) el.textContent = formatMaybeDecimal(pts);
      }
      renderTotal();
      saveState();
    });
  });

  // Mult buttons (simple prompt — clean and fast)
  document.querySelectorAll("button[data-mult-btn]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.multBtn;
      const cur = Number(state.entries[id]?.mult ?? 1);

      const next = prompt("Set multiplier (example: 1, 1.1, 2.5):", String(cur));
      if (next === null) return;

      const num = Number(next);
      if (!Number.isFinite(num) || num <= 0) return;

      state.entries[id] = state.entries[id] ?? { amount: "", mult: 1 };
      state.entries[id].mult = clamp(num, 0.01, 999);

      renderActions();
      saveState();
    });
  });
}

function cssSafe(str) {
  return str.replace(/[^a-zA-Z0-9_-]/g, "_");
}

function wireGlobalEvents() {
  // tabs
  document.querySelectorAll(".tabbtn").forEach((b) => {
    b.addEventListener("click", () => setTab(b.dataset.tab));
  });

  // day select
  document.getElementById("daySelect").addEventListener("change", (e) => {
    state.day = e.target.value;
    renderActions();
    saveState();
  });

  // rounding
  document.getElementById("roundingSelect").addEventListener("change", (e) => {
    state.rounding = e.target.value;
    renderActions();
    saveState();
  });

  // research dropdowns
  document.addEventListener("change", (e) => {
    const sel = e.target;
    if (!(sel instanceof HTMLSelectElement)) return;

    const key = sel.dataset.research;
    if (key) {
      state.research[key] = Number(sel.value) || 0;
      // research impacts calculator points immediately
      renderActions();
      renderResearch();
      saveState();
    }
  });

  // speedups inputs
  document.addEventListener("input", (e) => {
    const inp = e.target;
    if (!(inp instanceof HTMLInputElement)) return;

    const k = inp.dataset.speedup;
    if (k) {
      const v = clamp(Number(inp.value) || 0, 0, 999999);
      state.speedups[k] = v;
      updateSpeedupTotals();
      saveState();
    }
  });

  // reset
  document.getElementById("resetBtn").addEventListener("click", () => {
    if (!confirm("Reset all inputs?")) return;

    state.entries = {};
    state.speedups = Object.fromEntries(SPEEDUPS.map(s => [s.key, 0]));
    state.research = Object.fromEntries(RESEARCH_NODES.map(n => [n.key, 0]));
    state.rounding = "none";

    document.getElementById("roundingSelect").value = "none";
    renderActions();
    renderResearch();
    renderSpeedups();
    saveState();
  });
}

// ---------- Init ----------
function init() {
  loadState();

  document.getElementById("daySelect").value = state.day;
  document.getElementById("roundingSelect").value = state.rounding;

  // first paint
  renderActions();
  renderResearch();
  renderSpeedups();

  wireGlobalEvents();

  // tab last
  setTab(state.tab);

  // show saved time even on first load
  document.getElementById("savedText").textContent = `Saved ${nowSavedText()}`;
}

init();
