const $ = (id) => document.getElementById(id);


function showFatalError(err) {
  try {
    let bar = document.getElementById('fatalErrorBar');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'fatalErrorBar';
      bar.style.position = 'fixed';
      bar.style.left = '0';
      bar.style.right = '0';
      bar.style.top = '0';
      bar.style.zIndex = '99999';
      bar.style.background = '#8b1b1b';
      bar.style.color = 'white';
      bar.style.padding = '10px 12px';
      bar.style.fontFamily = 'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif';
      bar.style.fontSize = '12px';
      bar.style.whiteSpace = 'pre-wrap';
      document.body.appendChild(bar);
    }
    const msg = (err && err.stack) ? String(err.stack) : String(err);
    bar.textContent = 'App error: ' + msg;
  } catch {}
}

const STORE_KEY = 'unionPoints.v2';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

const RESEARCH_KEYS = [
  'All Points Increase',
  'Intelligence Motivation',
  'Accelerator Motivation',
  'Summoning Motivation',
  'Construction Motivation',
  'Research Motivation',
  'Training Motivation',
  'Enemy Kill Motivation'
];

const MAX_LEVELS = {
  'All Points Increase': 20,
  // All Motivation buffs max at 10
};

function maxLevelForKey(key){
  if (key === 'All Points Increase') return 20;
  return 10;
}

const DEFAULTS = {
  activeTab: 'research',
  day: 'Monday',
  roundMode: 'none',
  levels: Object.fromEntries(RESEARCH_KEYS.map(k => [k, 0])),
  qtyByDay: {}, // { Monday: { idx: qty } }
  speedups: { s8:0, s3:0, s1:0, s15:0, s5:0, s1m:0 }
};

function structuredCloneCompat(obj){
  return JSON.parse(JSON.stringify(obj));
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return structuredCloneCompat(DEFAULTS);
    const parsed = JSON.parse(raw);

    // Migrate from v1 if present
    const v1raw = localStorage.getItem('unionPoints.v1');
    if (!raw && v1raw) {
      const v1 = JSON.parse(v1raw);
      return {
        ...structuredCloneCompat(DEFAULTS),
        ...v1,
        activeTab: v1.activeTab || 'research'
      };
    }

    const s = structuredCloneCompat(DEFAULTS);
    if (parsed && typeof parsed === 'object') {
      if (parsed.activeTab) s.activeTab = parsed.activeTab;
      if (parsed.day) s.day = parsed.day;
      if (parsed.roundMode) s.roundMode = parsed.roundMode;
      s.qtyByDay = parsed.qtyByDay || s.qtyByDay;
      s.speedups = parsed.speedups || s.speedups;
      s.levels = { ...s.levels, ...(parsed.levels || {}) };
    }
    return s;
  } catch {
    return structuredCloneCompat(DEFAULTS);
  }
}

function saveState(state) {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

let dirtyTimer = null;
function setSavedStatus(text, isDirty=false) {
  const el = $('saveStatus');
  if (!el) return;
  el.textContent = text;
  if (isDirty) {
    el.style.borderColor = 'rgba(255,255,255,.14)';
    el.style.color = '#f3f4f7';
  } else {
    el.style.borderColor = 'rgba(215,179,90,.28)';
    el.style.color = '#f1d083';
  }
}
function setDirty() {
  setSavedStatus('Saving…', true);
  if (dirtyTimer) clearTimeout(dirtyTimer);
  dirtyTimer = setTimeout(() => setSavedStatus('Saved', false), 350);
}

function levelToPct(level) {
  const lvl = Number(level || 0);
  return (lvl * 5) / 100;
}

function getBuffPct(levels, buffName) {
  if (!buffName) return 0;
  return levelToPct(levels[buffName] || 0);
}

function applyRounding(x, mode) {
  if (!isFinite(x)) return 0;
  if (mode === 'floor') return Math.floor(x);
  if (mode === 'round') return Math.round(x);
  if (mode === 'ceil') return Math.ceil(x);
  return x;
}

const NF_INT = new Intl.NumberFormat(undefined);
const NF_DEC = new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function formatNumber(x) {
  if (!isFinite(x)) return '0';
  const isInt = Math.abs(x - Math.round(x)) < 1e-9;
  return isInt ? NF_INT.format(Math.round(x)) : NF_DEC.format(x);
}

function activateTab(state, which) {
  const isResearch = which === 'research';
  $('tabResearch').classList.toggle('active', isResearch);
  $('tabCalculator').classList.toggle('active', !isResearch);

  $('tabResearch').setAttribute('aria-selected', String(isResearch));
  $('tabCalculator').setAttribute('aria-selected', String(!isResearch));

  $('panelResearch').classList.toggle('active', isResearch);
  $('panelCalculator').classList.toggle('active', !isResearch);

  state.activeTab = which;
  saveState(state);
  setDirty();
}

function buildResearchUI(state) {
  const list = $('researchList');
  if (!list) return;
  list.innerHTML = '';

  RESEARCH_KEYS.forEach((key) => {
    const max = maxLevelForKey(key);
    const lvl = Math.min(max, Math.max(0, Number(state.levels[key] || 0)));
    state.levels[key] = lvl;

    const pct = Math.round(levelToPct(lvl) * 100);

    const wrap = document.createElement('div');
    wrap.className = 'researchItem compact';
    wrap.innerHTML = `
      <div class="researchTop">
        <div class="researchText">
          <div class="researchName">${escapeHtml(key)}</div>
          <div class="researchPct">+${pct}%</div>
        </div>
        <div class="researchPick">
          <select class="lvlSelect" data-key="${escapeAttr(key)}" aria-label="${escapeAttr(key)} level">
            ${Array.from({length: max + 1}, (_, i) => `<option value="${i}" ${i===lvl?'selected':''}>${i}</option>`).join('')}
          </select>
        </div>
      </div>
    `;
    list.appendChild(wrap);
  });

  list.onchange = (e) => {
    const sel = e.target.closest('select.lvlSelect');
    if (!sel) return;
    const key = sel.dataset.key;
    const max = maxLevelForKey(key);
    const val = clampInt(sel.value, max);
    state.levels[key] = val;

    const item = sel.closest('.researchItem');
    const pctEl = item ? item.querySelector('.researchPct') : null;
    if (pctEl) pctEl.textContent = `+${Math.round(levelToPct(val) * 100)}%`;

    saveState(state); setDirty();
    renderBuffPills(state.levels || {});
    renderTotals(state);
    renderSavedBadge();
  };
}

function renderBuffPills(levels) {
  const pills = $('buffPills');
  if (!pills) return;
  const allPct = Math.round(levelToPct(levels['All Points Increase']) * 100);
  const items = [
    ['All Points', allPct],
    ['Intelligence', Math.round(getBuffPct(levels, 'Intelligence Motivation')*100)],
    ['Accelerator', Math.round(getBuffPct(levels, 'Accelerator Motivation')*100)],
    ['Summoning', Math.round(getBuffPct(levels, 'Summoning Motivation')*100)],
    ['Construction', Math.round(getBuffPct(levels, 'Construction Motivation')*100)],
    ['Research', Math.round(getBuffPct(levels, 'Research Motivation')*100)],
    ['Training', Math.round(getBuffPct(levels, 'Training Motivation')*100)],
    ['Enemy Kill', Math.round(getBuffPct(levels, 'Enemy Kill Motivation')*100)]
  ];
  pills.innerHTML = '';
  items.forEach(([name,pct]) => {
    const d = document.createElement('div');
    d.className = 'pill';
    d.textContent = `${name}: +${pct}%`;
    pills.appendChild(d);
  });
}

function renderActions(state, data) {
  const levels = state.levels || {};
  const roundMode = state.roundMode || 'none';
  const day = state.day || 'Monday';

  const dayActions = (data.actions || []).filter(a => (a.day || '').toLowerCase() === day.toLowerCase());
  const qtyMap = state.qtyByDay?.[day] || {};

  const container = $('actions');
  container.innerHTML = '';

  $('actionCount').textContent = `${dayActions.length} action(s) loaded for ${day}.`;

  const allPct = levelToPct(levels['All Points Increase']);
  let total = 0;

  // Build cards
  dayActions.forEach((a, idx) => {
    const qty = Number(qtyMap[idx] || 0);

    const buffPct = getBuffPct(levels, a.buff);
    const pointsPerItem = a.basePoints * (1 + allPct + buffPct);

    const rowPointsRaw = qty * pointsPerItem;
    const rowPoints = applyRounding(rowPointsRaw, roundMode);
    total += rowPoints;

    const card = document.createElement('div');
    card.className = 'actionCard';
    card.dataset.idx = String(idx);

    const titleRow = document.createElement('div');
    titleRow.className = 'actionTitleRow';
    titleRow.textContent = a.action || '';

    const detailRow = document.createElement('div');
    detailRow.className = 'actionDetailRow';

    // Left: buff + points per item
    const infoBox = document.createElement('div');
    infoBox.className = 'actionInfoBox';

    const buffName = (a.buff && a.buff.name) ? a.buff.name : 'No buff';
    const buffLine = document.createElement('div');
    buffLine.className = 'actionBuff';
    buffLine.textContent = `${buffName}${a.unit && a.unit !== 1 ? ` • per ${formatNumber(a.unit)}` : ''}`;

    const ppiLine = document.createElement('div');
    ppiLine.className = 'actionPpi';
    ppiLine.textContent = `Pts/item: ${formatNumber(pointsPerItem)}`;

    infoBox.appendChild(buffLine);
    infoBox.appendChild(ppiLine);

    // Middle: qty input
    const qtyBox = document.createElement('div');
    qtyBox.className = 'actionQtyBox';
    const inp = document.createElement('input');
    inp.type = 'number';
    inp.min = '0';
    inp.step = '1';
    inp.inputMode = 'numeric';
    inp.value = String(qty);
    inp.dataset.idx = String(idx);
    qtyBox.appendChild(inp);

    // Right: points output
    const pointsBox = document.createElement('div');
    pointsBox.className = 'actionPointsBox';
    const ptsSpan = document.createElement('span');
    ptsSpan.className = 'actionRowPoints';
    ptsSpan.textContent = formatNumber(rowPoints);
    pointsBox.appendChild(ptsSpan);

    detailRow.appendChild(infoBox);
    detailRow.appendChild(qtyBox);
    detailRow.appendChild(pointsBox);

    card.appendChild(titleRow);
    card.appendChild(detailRow);
    container.appendChild(card);
  });

  // Update totals
  $('totalPoints').textContent = formatNumber(total);
  updateTotalNote(state, dayActions.length);

  // Save render context for input updates
  container._ctx = { day, dayActions, levels, roundMode, allPct, data };

  // Bind delegated input once
  if (!container._bound) {
    container._bound = true;
    container.addEventListener('input', (e) => {
      const el = e.target;
      if (!(el instanceof HTMLInputElement)) return;
      const idx = Number(el.dataset.idx);
      if (!Number.isFinite(idx)) return;

      const ctx = container._ctx;
      if (!ctx) return;

      // Update state qty
      const d = ctx.day;
      state.qtyByDay = state.qtyByDay || {};
      state.qtyByDay[d] = state.qtyByDay[d] || {};
      const val = clampInt(el.value, 999999999);
      state.qtyByDay[d][idx] = val;

      // Recompute this row
      const a = ctx.dayActions[idx];
      if (!a) return;

      const buffPct = getBuffPct(state.levels || {}, a.buff);
      const ppi = a.basePoints * (1 + levelToPct((state.levels || {})['All Points Increase']) + buffPct);
      const rowRaw = val * ppi;
      const rowPts = applyRounding(rowRaw, state.roundMode || 'none');

      const card = el.closest('.actionCard');
      if (card) {
        const ptsEl = card.querySelector('.actionRowPoints');
        if (ptsEl) ptsEl.textContent = formatNumber(rowPts);
        const ppiEl = card.querySelector('.actionPpi');
        if (ppiEl) ppiEl.textContent = `Pts/item: ${formatNumber(ppi)}`;
      }

      // Recompute total (fast loop)
      let tot = 0;
      for (let i = 0; i < ctx.dayActions.length; i++) {
        const ai = ctx.dayActions[i];
        const q = Number((state.qtyByDay?.[d] || {})[i] || 0);
        const bp = getBuffPct(state.levels || {}, ai.buff);
        const ppi2 = ai.basePoints * (1 + levelToPct((state.levels || {})['All Points Increase']) + bp);
        tot += applyRounding(q * ppi2, state.roundMode || 'none');
      }
      $('totalPoints').textContent = formatNumber(tot);

      saveState(state);
      setDirty();
    }, { passive: true });
  }
}

function renderSpeedups(state) {
  const s = state.speedups || {};
  const minutes =
    (Number(s.s8||0)*8*60) +
    (Number(s.s3||0)*3*60) +
    (Number(s.s1||0)*60) +
    (Number(s.s15||0)*15) +
    (Number(s.s5||0)*5) +
    (Number(s.s1m||0)*1);

  $('speedMinutes').textContent = formatNumber(minutes);
  $('speedHours').textContent = formatNumber(minutes/60);
}

function renderAll(state, data) {
  renderBuffPills(state.levels || {});
  renderActions(state, data);
  renderSpeedups(state);
}

async function init() {
  const state = loadState();

  // service worker
  if ('serviceWorker' in navigator) {
    try { await navigator.serviceWorker.register('./sw.js'); } catch {}
  }

  // load points data (works on hosted site and file://)
  let data = null;
  try {
    data = await fetch('./points-data.json', { cache: 'no-store' }).then(r => r.json());
  } catch {
    const el = document.getElementById('pointsData');
    if (el && el.textContent.trim()) {
      try { data = JSON.parse(el.textContent); } catch {}
    }
  }
  if (!data) data = { actions: [], days: DAYS };

  // day dropdown
  const daySel = $('daySelect');
  daySel.innerHTML = '';
  DAYS.forEach((d) => {
    const opt = document.createElement('option');
    opt.value = d;
    opt.textContent = d;
    daySel.appendChild(opt);
  });
  daySel.value = DAYS.includes(state.day) ? state.day : 'Monday';
  daySel.addEventListener('change', () => {
    state.day = daySel.value;
    saveState(state); setDirty();
    renderAll(state, data);
  });

  // rounding
  $('roundMode').value = state.roundMode || 'none';
  $('roundMode').addEventListener('change', () => {
    state.roundMode = $('roundMode').value;
    saveState(state); setDirty();
    renderAll(state, data);
  });

  // speedups inputs
  [['s8',8*60],['s3',3*60],['s1',60],['s15',15],['s5',5],['s1m',1]].forEach(([id]) => {
    $(id).value = state.speedups[id] ?? 0;
    $(id).addEventListener('input', () => {
      state.speedups[id] = Number($(id).value || 0);
      saveState(state); setDirty();
      renderSpeedups(state);
    });
  });

  // tabs
  $('tabResearch').addEventListener('click', () => activateTab(state, 'research'));
  $('tabCalculator').addEventListener('click', () => activateTab(state, 'calculator'));

  // reset
  $('resetBtn').addEventListener('click', () => {
    if (!confirm('Reset all research levels, quantities, and speedups on this device?')) return;
    const fresh = structuredCloneCompat(DEFAULTS);
    fresh.activeTab = state.activeTab;
    Object.assign(state, fresh);
    saveState(state); setDirty();
    buildResearchUI(state);
    $('daySelect').value = state.day;
    $('roundMode').value = state.roundMode;
    [['s8'],['s3'],['s1'],['s15'],['s5'],['s1m']].forEach(([id]) => $(id).value = 0);
    renderAll(state, data);
  });

  // initial render
  buildResearchUI(state);
  activateTab(state, state.activeTab === 'calculator' ? 'calculator' : 'research');
  setSavedStatus('Saved', false);
  renderAll(state, data);
}

function clampInt(value, max=999) {
  const n = Number(String(value).replace(/[^\d]/g,''));
  if (!isFinite(n)) return 0;
  return Math.max(0, Math.min(max, Math.floor(n)));
}


function escapeAttr(s){ return String(s).replace(/"/g, '&quot;'); }
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, (c)=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }
function cssSafe(s){ return String(s).replace(/[^a-zA-Z0-9_-]/g,'_'); }
function cssEscape(s){
  // Used inside attribute selector; escape quotes/backslashes
  return String(s).replace(/\\/g,'\\\\').replace(/"/g,'\\"');
}

init();
  // Clamp research levels to allowed maxima
  RESEARCH_KEYS.forEach((k) => {
    const max = maxLevelForKey(k);
    state.levels[k] = Math.min(max, Math.max(0, Number(state.levels[k] || 0)));
  });



document.addEventListener('DOMContentLoaded', () => { init().catch(showFatalError); });
