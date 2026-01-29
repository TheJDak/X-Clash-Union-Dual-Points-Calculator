
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Settings2, 
  Calculator, 
  Zap, 
  RotateCcw, 
  CheckCircle2, 
  ChevronDown, 
  Trophy,
  History
} from 'lucide-react';
import { AppState, Day, RoundingMode, ResearchLevels, Speedups } from './types';
import { DAYS, RESEARCH_KEYS, MAX_LEVELS, ACTIONS } from './constants';
import { calculatePoints, formatNum } from './utils/calculations';

const STORAGE_KEY = 'xclash_pro_v1';

const INITIAL_STATE: AppState = {
  activeTab: 'calculator',
  selectedDay: 'Monday',
  roundingMode: 'none',
  research: Object.fromEntries(RESEARCH_KEYS.map(k => [k, 0])),
  quantities: {},
  speedups: {
    s8h: 0, s3h: 0, s1h: 0, s15m: 0, s5m: 0, s1m: 0
  }
};

export default function App() {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return { ...INITIAL_STATE, ...JSON.parse(saved) };
      } catch (e) {
        return INITIAL_STATE;
      }
    }
    return INITIAL_STATE;
  });

  const [lastSaved, setLastSaved] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    setLastSaved(new Date().toLocaleTimeString());
  }, [state]);

  const handleReset = useCallback(() => {
    if (confirm('Are you sure you want to reset everything?')) {
      setState(prev => ({
        ...INITIAL_STATE,
        activeTab: prev.activeTab
      }));
    }
  }, []);

  const totalPoints = useMemo(() => {
    return ACTIONS.reduce((sum, action) => {
      if (action.day !== state.selectedDay) return sum;
      const qty = state.quantities[action.id] || 0;
      if (qty <= 0) return sum;

      const allPointsLvl = state.research['All Points Increase'] || 0;
      const specificLvl = action.buff ? (state.research[action.buff] || 0) : 0;
      
      return sum + calculatePoints(
        qty, 
        action.basePoints, 
        action.unit, 
        allPointsLvl, 
        specificLvl, 
        state.roundingMode
      );
    }, 0);
  }, [state.selectedDay, state.quantities, state.research, state.roundingMode]);

  const totalSpeedupMinutes = useMemo(() => {
    const s = state.speedups;
    return (s.s8h * 480) + (s.s3h * 180) + (s.s1h * 60) + (s.s15m * 15) + (s.s5m * 5) + s.s1m;
  }, [state.speedups]);

  const renderHeader = () => (
    <header className="sticky top-0 z-50 bg-[#0b0c10]/95 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Trophy className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="text-lg font-black tracking-tight text-white uppercase italic">Union Dual Pro</h1>
          <p className="text-[10px] text-blue-400 font-bold tracking-widest uppercase">X-Clash Ultimate Survivor</p>
        </div>
      </div>
      <div className="flex flex-col items-end">
        {lastSaved && (
          <div className="flex items-center gap-1.5 text-[10px] text-white/40 font-medium">
            <CheckCircle2 size={10} className="text-green-500" />
            <span>Saved {lastSaved}</span>
          </div>
        )}
      </div>
    </header>
  );

  const renderTabs = () => (
    <nav className="flex bg-[#161b22] p-1.5 rounded-2xl mx-4 my-4 border border-white/5">
      {(['calculator', 'research', 'speedups'] as const).map(tab => (
        <button
          key={tab}
          onClick={() => setState(s => ({ ...s, activeTab: tab }))}
          className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all duration-200 ${
            state.activeTab === tab 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
              : 'text-white/40 hover:text-white/70'
          }`}
        >
          {tab === 'calculator' && <Calculator size={18} />}
          {tab === 'research' && <Settings2 size={18} />}
          {tab === 'speedups' && <Zap size={18} />}
          <span className="capitalize">{tab}</span>
        </button>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen pb-24 max-w-md mx-auto relative">
      {renderHeader()}
      {renderTabs()}

      <main className="px-4 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        
        {state.activeTab === 'research' && (
          <div className="space-y-4">
            <div className="bg-[#1c2128] rounded-2xl p-4 border border-white/5">
              <h2 className="text-lg font-bold mb-1">Research Center</h2>
              <p className="text-sm text-white/50 mb-4">Set your technology levels. Each level provides a +5% point bonus.</p>
              
              <div className="space-y-3">
                {RESEARCH_KEYS.map(key => (
                  <div key={key} className="bg-[#0d1117] p-3 rounded-xl border border-white/5 flex items-center justify-between group">
                    <div>
                      <div className="text-sm font-bold text-white/90 group-hover:text-blue-400 transition-colors">{key}</div>
                      <div className="text-xs text-blue-500 font-black">+{state.research[key] * 5}% Bonus</div>
                    </div>
                    <div className="relative">
                      <select
                        value={state.research[key]}
                        onChange={e => setState(s => ({ ...s, research: { ...s.research, [key]: Number(e.target.value) } }))}
                        className="appearance-none bg-[#161b22] text-white border border-white/10 rounded-lg px-4 py-2 pr-10 font-bold focus:outline-none focus:border-blue-500/50"
                      >
                        {Array.from({ length: MAX_LEVELS[key] + 1 }, (_, i) => (
                          <option key={i} value={i}>Level {i}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" size={14} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button 
              onClick={handleReset}
              className="w-full py-4 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <RotateCcw size={18} />
              Reset All Progress
            </button>
          </div>
        )}

        {state.activeTab === 'calculator' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 absolute left-3 top-2">Current Day</label>
                <select
                  value={state.selectedDay}
                  onChange={e => setState(s => ({ ...s, selectedDay: e.target.value as Day }))}
                  className="w-full bg-[#1c2128] border border-white/10 rounded-2xl pt-7 pb-3 px-3 text-sm font-bold appearance-none focus:outline-none focus:border-blue-500/50"
                >
                  {DAYS.map(day => <option key={day} value={day}>{day}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" size={14} />
              </div>
              <div className="relative">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 absolute left-3 top-2">Rounding</label>
                <select
                  value={state.roundingMode}
                  onChange={e => setState(s => ({ ...s, roundingMode: e.target.value as RoundingMode }))}
                  className="w-full bg-[#1c2128] border border-white/10 rounded-2xl pt-7 pb-3 px-3 text-sm font-bold appearance-none focus:outline-none focus:border-blue-500/50"
                >
                  <option value="none">None</option>
                  <option value="floor">Down</option>
                  <option value="round">Nearest</option>
                  <option value="ceil">Up</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" size={14} />
              </div>
            </div>

            <div className="space-y-3">
              {ACTIONS.filter(a => a.day === state.selectedDay).map(action => {
                const qty = state.quantities[action.id] || 0;
                const allLvl = state.research['All Points Increase'] || 0;
                const specLvl = action.buff ? (state.research[action.buff] || 0) : 0;
                const points = calculatePoints(qty, action.basePoints, action.unit, allLvl, specLvl, state.roundingMode);
                const multiplier = 1 + (allLvl * 0.05) + (specLvl * 0.05);

                return (
                  <div key={action.id} className="bg-[#1c2128] border border-white/5 rounded-2xl p-4 space-y-3 shadow-sm">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold leading-tight line-clamp-2 text-white/90">{action.action}</h3>
                        <div className="mt-1 flex flex-wrap gap-2">
                          <span className="text-[10px] px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full font-bold">
                            x{multiplier.toFixed(2)} Mult
                          </span>
                          {action.buff && (
                            <span className="text-[10px] px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full font-bold">
                              {action.buff.split(' ')[0]}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-black text-blue-400 leading-none">{formatNum(points)}</div>
                        <div className="text-[10px] text-white/20 font-bold uppercase mt-1">Points</div>
                      </div>
                    </div>
                    
                    <div className="relative group">
                      <input
                        type="number"
                        inputMode="numeric"
                        placeholder="Enter amount..."
                        value={qty || ''}
                        onChange={e => {
                          const val = Math.max(0, parseInt(e.target.value) || 0);
                          setState(s => ({ ...s, quantities: { ...s.quantities, [action.id]: val } }));
                        }}
                        className="w-full bg-[#0d1117] border border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-blue-500/50 transition-colors placeholder:text-white/10"
                      />
                      <button 
                        onClick={() => setState(s => ({ ...s, quantities: { ...s.quantities, [action.id]: 0 } }))}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-opacity ${qty > 0 ? 'opacity-100' : 'opacity-0'}`}
                      >
                        <RotateCcw size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
              
              {ACTIONS.filter(a => a.day === state.selectedDay).length === 0 && (
                <div className="bg-[#1c2128] border border-white/5 rounded-2xl p-8 text-center">
                  <p className="text-white/30 font-bold">No point data found for {state.selectedDay}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {state.activeTab === 'speedups' && (
          <div className="space-y-4">
            <div className="bg-[#1c2128] rounded-2xl p-4 border border-white/5">
              <h2 className="text-lg font-bold mb-1">Speedup Calculator</h2>
              <p className="text-sm text-white/50 mb-6">Enter your speedup items to see total time values.</p>
              
              <div className="grid grid-cols-2 gap-4">
                {(['s8h', 's3h', 's1h', 's15m', 's5m', 's1m'] as const).map(key => (
                  <div key={key} className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-white/30 ml-1">
                      {key.replace('s', '').toUpperCase()}
                    </label>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={state.speedups[key] || ''}
                      placeholder="0"
                      onChange={e => {
                        const val = Math.max(0, parseInt(e.target.value) || 0);
                        setState(s => ({ ...s, speedups: { ...s.speedups, [key]: val } }));
                      }}
                      className="w-full bg-[#0d1117] border border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 grid grid-cols-2 gap-4">
                <div className="bg-[#0d1117] p-4 rounded-xl border border-white/5">
                  <div className="text-[10px] text-blue-500 font-black uppercase mb-1">Total Minutes</div>
                  <div className="text-xl font-black">{formatNum(totalSpeedupMinutes)}</div>
                </div>
                <div className="bg-[#0d1117] p-4 rounded-xl border border-white/5">
                  <div className="text-[10px] text-indigo-500 font-black uppercase mb-1">Total Hours</div>
                  <div className="text-xl font-black">{(totalSpeedupMinutes / 60).toFixed(1)}h</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Action Header for Totals (Sticky Bottom) */}
      <div className="fixed bottom-6 left-4 right-4 z-50 animate-in slide-in-from-bottom-10 duration-500">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[28px] p-5 shadow-2xl shadow-blue-900/40 flex items-center justify-between border border-white/20 backdrop-blur-md">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-1 leading-none">Total Points</span>
            <div className="text-2xl font-black text-white leading-none tracking-tight">
              {formatNum(totalPoints)}
            </div>
          </div>
          <div className="bg-white/10 w-12 h-12 rounded-full flex items-center justify-center border border-white/10">
            <History className="text-white w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
}
