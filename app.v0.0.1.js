/* Union Dual Points Calculator — v0.0.2 */

const DAY_TITLES = {
  "Monday": "Intelligence Training",
  "Tuesday": "Castle Construction",
  "Wednesday": "Technology Research",
  "Thursday": "Hero Upgrade",
  "Friday": "Full Preparation",
  "Saturday": "Defeat the Enemy",
  "Sunday": "Rest Day"
};

/* =========================
   ACTIONS (from your updated "points table" tab)
========================= */
const ACTIONS = [
  /* Monday */
  { day:"Monday", action:"Spend 660 Hero EXP", basePoints:1, buff:"n/a", usage:660 },
  { day:"Monday", action:"Spend 1 Stamina", basePoints:150, buff:"n/a", usage:1 },
  { day:"Monday", action:"Complete 1 Intelligence Quest", basePoints:10000, buff:"Intelligence Motivation", usage:1 },
  { day:"Monday", action:"Spend 1 Mytstic Beast EXP", basePoints:3, buff:"n/a", usage:1 },
  { day:"Monday", action:"Use Mystic Beast Breakthrough Potion", basePoints:2500, buff:"n/a", usage:1 },
  { day:"Monday", action:"Gather 100 Food", basePoints:20, buff:"n/a", usage:100 },
  { day:"Monday", action:"Gather 100 Iron", basePoints:20, buff:"n/a", usage:100 },
  { day:"Monday", action:"Gather 60 Gold", basePoints:20, buff:"n/a", usage:60 },

  /* Tuesday */
  { day:"Tuesday", action:"Dispatch 1 Legendary Wagon", basePoints:100000, buff:"n/a", usage:1 },
  { day:"Tuesday", action:"Perform 1 orange Tavern Quest", basePoints:75000, buff:"n/a", usage:1 },
  { day:"Tuesday", action:"Use 1-minute Building Speed Up", basePoints:50, buff:"Accelerator Motivation", usage:1 },
  { day:"Tuesday", action:"Increase Building CP by 1", basePoints:10, buff:"Construction Motivation", usage:1 },
  { day:"Tuesday", action:"Perform 1 Survivor Recruitment", basePoints:1500, buff:"n/a", usage:1 },

  /* Wednesday */
  { day:"Wednesday", action:"Spend 1 Mytstic Beast EXP", basePoints:3, buff:"n/a", usage:1 },
  { day:"Wednesday", action:"Use 1 Mythic Beast EXP Potion", basePoints:3000, buff:"n/a", usage:1 },
  { day:"Wednesday", action:"Use 1 Mythic Beast Breakthrough Potion", basePoints:2500, buff:"n/a", usage:1 },
  { day:"Wednesday", action:"Use 1 Hero EXP", basePoints:0.0015, buff:"n/a", usage:1 },
  { day:"Wednesday", action:"Use 1 Hero EXP Potion", basePoints:1500, buff:"n/a", usage:1 },
  { day:"Wednesday", action:"Spend 1 Stamina", basePoints:150, buff:"n/a", usage:1 },
  { day:"Wednesday", action:"Complete 1 Intelligence Quest", basePoints:10000, buff:"Intelligence Motivation", usage:1 },
  { day:"Wednesday", action:"Use 1-minute Research Speed Up", basePoints:50, buff:"Accelerator Motivation", usage:1 },
  { day:"Wednesday", action:"Increase Research CP by 1", basePoints:10, buff:"Research Motivation", usage:1 },
  { day:"Wednesday", action:"Use 1 Mystery Hero Token", basePoints:2000, buff:"Summoning Motivation", usage:1 },
  { day:"Wednesday", action:"Perform 1 Survivor Recruitment", basePoints:1500, buff:"n/a", usage:1 },

  /* Thursday */
  { day:"Thursday", action:"Complete 1 Intelligence Quest", basePoints:10000, buff:"Intelligence Motivation", usage:1 },
  { day:"Thursday", action:"Use 1 Hero EXP Potion", basePoints:1500, buff:"n/a", usage:1 },
  { day:"Thursday", action:"Use 1-minute Training Speed Up", basePoints:50, buff:"Accelerator Motivation", usage:1 },
  { day:"Thursday", action:"Increase Training CP by 1", basePoints:10, buff:"Training Motivation", usage:1 },
  { day:"Thursday", action:"Enemy Kill 1 Point", basePoints:1, buff:"Enemy Kill Motivation", usage:1 },
  { day:"Thursday", action:"Train 1 Soldier", basePoints:2, buff:"Training Motivation", usage:1 },

  /* Friday */
  { day:"Friday", action:"Complete 1 Research", basePoints:100000, buff:"Research Motivation", usage:1 },
  { day:"Friday", action:"Increase Research CP by 1", basePoints:10, buff:"Research Motivation", usage:1 },
  { day:"Friday", action:"Use 1-minute Research Speed Up", basePoints:50, buff:"Accelerator Motivation", usage:1 },
  { day:"Friday", action:"Use 1-minute Building Speed Up", basePoints:50, buff:"Accelerator Motivation", usage:1 },
  { day:"Friday", action:"Use 1-minute Training Speed Up", basePoints:50, buff:"Accelerator Motivation", usage:1 },
  { day:"Friday", action:"Use 1-minute Healing Speed Up", basePoints:50, buff:"Accelerator Motivation", usage:1 },
  { day:"Friday", action:"Increase Building CP by 1", basePoints:10, buff:"Construction Motivation", usage:1 },
  { day:"Friday", action:"Increase Training CP by 1", basePoints:10, buff:"Training Motivation", usage:1 },
  { day:"Friday", action:"Increase Healing CP by 1", basePoints:10, buff:"n/a", usage:1 },
  { day:"Friday", action:"Spend 1 Stamina", basePoints:150, buff:"n/a", usage:1 },
  { day:"Friday", action:"Use 1 Mystery Hero Token", basePoints:2000, buff:"Summoning Motivation", usage:1 },
  { day:"Friday", action:"Perform 1 Survivor Recruitment", basePoints:1500, buff:"n/a", usage:1 },
  { day:"Friday", action:"Enemy Kill 1 Point", basePoints:1, buff:"Enemy Kill Motivation", usage:1 },
  { day:"Friday", action:"Train 1 Soldier", basePoints:2, buff:"Training Motivation", usage:1 },
  { day:"Friday", action:"Lose 1 Soldier", basePoints:2, buff:"n/a", usage:1 },
  { day:"Friday", action:"Use 1 Hero EXP Potion", basePoints:1500, buff:"n/a", usage:1 },

  /* Saturday (your expanded “Lose Lv X Soldier” set) */
  { day:"Saturday", action:"Lose 1 Soldier", basePoints:2, buff:"n/a", usage:1 },
  { day:"Saturday", action:"Lose 1 Lv. 1 Soldier", basePoints:2, buff:"n/a", usage:1 },
  { day:"Saturday", action:"Lose 1 Lv. 2 Soldier", basePoints:3, buff:"n/a", usage:1 },
  { day:"Saturday", action:"Lose 1 Lv. 3 Soldier", basePoints:4, buff:"n/a", usage:1 },
  { day:"Saturday", action:"Lose 1 Lv. 4 Soldier", basePoints:5, buff:"n/a", usage:1 },
  { day:"Saturday", action:"Lose 1 Lv. 5 Soldier", basePoints:6, buff:"n/a", usage:1 },
  { day:"Saturday", action:"Lose 1 Lv. 6 Soldier", basePoints:7, buff:"n/a", usage:1 },
  { day:"Saturday", action:"Lose 1 Lv. 7 Soldier", basePoints:8, buff:"n/a", usage:1 },
  { day:"Saturday", action:"Lose 1 Lv. 8 Soldier", basePoints:9, buff:"n/a", usage:1 },
  { day:"Saturday", action:"Lose 1 Lv. 9 Soldier", basePoints:10, buff:"n/a", usage:1 },
  { day:"Saturday", action:"Lose 1 Lv. 10 Soldier", basePoints:11, buff:"n/a", usage:1 },

  /* Sunday */
  { day:"Sunday", action:"Rest Day", basePoints:0, buff:"n/a", usage:1 }
];

/* Research nodes:
   - "All Points Increase" applies to everything
   - action buff applies only to matching action rows
*/
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

const SPEEDUPS = [
  { key: "8h", label: "8H", minutes: 480 },
  { key: "3h", label: "3H", minutes: 180 },
  { key: "1h", label: "1H", minutes: 60 },
  { key: "15m", label: "15M", minutes: 15 },
  { key: "5m", label: "5M", minutes: 5 },
  { key: "1m", label: "1M", minutes: 1 },
];

const STORAGE_KEY = "union_dual_points_state_v002";

const state = {
  tab: "calculator",
  day: "Monday",
  research: Object.fromEntries(RESEARCH_NODES.map(n => [n.key, 0])),
  entries: {}, // actionId -> { amount }
  speedups: Object.fromEntries(SPEEDUPS.map(s => [s.key, 0])),
};

function $(id){ return document.getElementById(id); }
function safeOn(el, event, fn){ if (el) el.addEventListener(event, fn); }

function clamp(n, min, max) { return Math.min(max, Math.max(min, n)); }
function round1(n){ return Math.round(n * 10) / 10; }

function fmt1(n){
  // always show 1 decimal
  return round1(n).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

function nowSavedText() {
  const d = new Date();
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" });
}

function actionIdFor(a) { return `${a.day}__${a.action}`; }
function cssSafe(str) { return str.replace(/[^a-zA-Z0-9_-]/g, "_"); }

function getBuffPct(nodeKey) {
  const level = Number(state.research[nodeKey] ?? 0);
  return level * 0.05; // 5% per level
}

function combinedMultiplierFor(actionRow){
  const allPct = getBuffPct("All Points Increase");
  const buffPct = (actionRow.buff && actionRow.buff !== "n/a") ? getBuffPct(actionRow.buff) : 0;
  return { allPct, buffPct, totalPct: allPct + buffPct, mult: 1 + allPct + buffPct };
}

function pointsPerUnit(actionRow) {
  const { mult } = combinedMultiplierFor(actionRow);
  const adjusted = actionRow.basePoints * mult;
  return adjusted / actionRow.usage;
}

function calcActionPoints(actionRow) {
  const id = actionIdFor(actionRow);
  const entry = state.entries[id] ?? { amount: 0 };
  const amt = Number(entry.amount) || 0;
  return round1(amt * pointsPerUnit(actionRow));
}

function calcTotalPoints() {
  const todays = ACTIONS.filter(a => a.day === state.day);
  const total = todays.reduce((sum, a) => sum + calcActionPoints(a), 0);
  return round1(total);
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  const s = $("savedText");
  if (s) s.textContent = `Saved ${nowSavedText()}`;
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      state.tab = parsed.tab ?? state.tab;
      state.day = parsed.day ?? state.day;
      state.research = { ...state.research, ...(parsed.research ?? {}) };
      state.entries = parsed.entries ?? {};
      state.speedups = { ...state.speedups, ...(parsed.speedups ?? {}) };
    }
  } catch { /* ignore */ }
}

function setDayTheme(){
  const el = $("dayTheme");
  if (!el) return;
  el.textContent = DAY_TITLES[state.day] || "—";
}

function setTab(tab) {
  state.tab = tab;

  const calc = $("tab-calculator");
  const res = $("tab-research");
  const spd = $("tab-speedups");

  if (calc) calc.classList.toggle("hidden", tab !== "calculator");
  if (res)  res.classList.toggle("hidden", tab !== "research");
  if (spd)  spd.classList.toggle("hidden", tab !== "speedups");

  const btns = [...document.querySelectorAll(".tabbtn")];
  btns.forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));

  const idx = Math.max(0, btns.findIndex(b => b.dataset.tab === tab));
  const highlight = $("tabHighlight");
  if (highlight) highlight.style.transform = `translateX(${idx * 100}%)`;

  saveState();
}

function renderTotal() {
  const el = $("totalPoints");
  if (el) el.textContent = fmt1(calcTotalPoints());
}

function wireActionEvents() {
  document.querySelectorAll("input[data-amount]").forEach((inp) => {
    inp.addEventListener("input", (e) => {
      const id = e.target.dataset.amount;
      const val = e.target.value;

      state.entries[id] = state.entries[id] ?? { amount: "" };
      state.entries[id].amount = val;

      const a = ACTIONS.find(x => actionIdFor(x) === id);
      if (a) {
        const pts = calcActionPoints(a);
        const elPts = document.getElementById(`pts_${cssSafe(id)}`);
        if (elPts) elPts.textContent = fmt1(pts);
      }

      renderTotal();
      saveState();
    });
  });
}

function renderActions() {
  const list = $("actionList");
  if (!list) return;

  list.innerHTML = "";
  setDayTheme();

  const todays = ACTIONS.filter(a => a.day === state.day);

  // If Sunday, keep it simple.
  if (state.day === "Sunday") {
    const card = document.createElement("div");
    card.className = "glass-card action-card";
    card.innerHTML = `
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <div class="font-extrabold text-[15px] leading-snug">Rest Day</div>
          <div class="mt-2 flex flex-wrap items-center gap-2">
            <span class="pill">All Points Increase applies, but base is 0</span>
          </div>
        </div>
        <div class="text-right shrink-0">
          <div class="pointsText">0.0</div>
          <div class="pointsLabel">Points</div>
        </div>
      </div>
    `;
    list.appendChild(card);
    renderTotal();
    return;
  }

  todays.forEach((a) => {
    const id = actionIdFor(a);
    const entry = state.entries[id] ?? { amount: "" };
    const pts = calcActionPoints(a);

    const { allPct, buffPct, totalPct, mult } = combinedMultiplierFor(a);

    const hasBuff = a.buff && a.buff !== "n/a";
    const allTxt = `All Points: +${Math.round(allPct * 100)}%`;
    const buffTxt = hasBuff ? `${a.buff}: +${Math.round(buffPct * 100)}%` : `No action buff`;
    const multTxt = `Multiplier: x${mult.toFixed(2)} (+${Math.round(totalPct * 100)}%)`;

    const card = document.createElement("div");
    card.className = "glass-card action-card";

    card.innerHTML = `
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <div class="font-extrabold text-[15px] leading-snug">${a.action}</div>
          <div class="mt-2 flex flex-wrap items-center gap-2">
            <span class="pill">${multTxt}</span>
            <span class="pill">${allTxt}</span>
            ${hasBuff ? `<span class="pill tag">${buffTxt}</span>` : `<span class="pill">${buffTxt}</span>`}
          </div>
        </div>

        <div class="text-right shrink-0">
          <div class="pointsText" id="pts_${cssSafe(id)}">${fmt1(pts)}</div>
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

function makeLevelOptions(selected) {
  const max = 30;
  let html = "";
  for (let i = 0; i <= max; i++) {
    const sel = (i === Number(selected)) ? "selected" : "";
    html += `<option value="${i}" ${sel}>Level ${i}</option>`;
  }
  return html;
}

function renderResearch() {
  const wrap = $("researchList");
  if (!wrap) return;

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

function renderSpeedups() {
  const grid = $("speedupsGrid");
  if (!grid) return;

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

  const m = $("totalMinutes");
  const h = $("totalHours");
  if (m) m.textContent = totalMin.toLocaleString();
  if (h) h.textContent = `${(totalMin / 60).toFixed(1)}h`;
}

function wireGlobalEvents() {
  // tabs
  document.querySelectorAll(".tabbtn").forEach((b) => {
    b.addEventListener("click", () => setTab(b.dataset.tab));
  });

  // day
  safeOn($("daySelect"), "change", (e) => {
    state.day = e.target.value;
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
      renderActions();  // multiplier display updates here
      renderResearch();
      saveState();
    }
  });

  // speedups
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
  safeOn($("resetBtn"), "click", () => {
    if (!confirm("Reset all inputs?")) return;

    state.entries = {};
    state.speedups = Object.fromEntries(SPEEDUPS.map(s => [s.key, 0]));
    state.research = Object.fromEntries(RESEARCH_NODES.map(n => [n.key, 0]));

    renderActions();
    renderResearch();
    renderSpeedups();
    saveState();
  });
}

function init() {
  loadState();

  const day = $("daySelect");
  if (day) day.value = state.day;

  renderActions();
  renderResearch();
  renderSpeedups();
  wireGlobalEvents();

  setTab(state.tab);

  const s = $("savedText");
  if (s) s.textContent = `Saved ${nowSavedText()}`;
}

init();
