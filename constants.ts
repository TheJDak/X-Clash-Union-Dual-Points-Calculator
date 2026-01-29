
import { ActionData, Day } from './types';

export const DAYS: Day[] = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

export const RESEARCH_KEYS = [
  'All Points Increase',
  'Intelligence Motivation',
  'Accelerator Motivation',
  'Summoning Motivation',
  'Construction Motivation',
  'Research Motivation',
  'Training Motivation',
  'Enemy Kill Motivation'
];

export const MAX_LEVELS: Record<string, number> = {
  'All Points Increase': 20,
  'Intelligence Motivation': 10,
  'Accelerator Motivation': 10,
  'Summoning Motivation': 10,
  'Construction Motivation': 10,
  'Research Motivation': 10,
  'Training Motivation': 10,
  'Enemy Kill Motivation': 10
};

export const RAW_ACTIONS: Omit<ActionData, 'id'>[] = [
  // Monday
  { day: 'Monday', action: 'Spend 660 Hero EXP', basePoints: 1.0, buff: null, unit: 660.0 },
  { day: 'Monday', action: 'Spend 1 Stamina', basePoints: 150.0, buff: null, unit: 1.0 },
  { day: 'Monday', action: 'Complete 1 Intelligence Quest', basePoints: 10000.0, buff: 'Intelligence Motivation', unit: 1.0 },
  { day: 'Monday', action: 'Spend 1 Mystic Beast EXP', basePoints: 3.0, buff: null, unit: 1.0 },
  { day: 'Monday', action: 'Use Mystic Beast Breakthrough Potion', basePoints: 2500.0, buff: null, unit: 1.0 },
  { day: 'Monday', action: 'Gather 100 Food', basePoints: 20.0, buff: null, unit: 100.0 },
  { day: 'Monday', action: 'Gather 100 Iron', basePoints: 20.0, buff: null, unit: 100.0 },
  { day: 'Monday', action: 'Gather 60 Gold', basePoints: 20.0, buff: null, unit: 60.0 },
  // Tuesday
  { day: 'Tuesday', action: 'Dispatch 1 Legendary Wagon', basePoints: 100000.0, buff: null, unit: 1.0 },
  { day: 'Tuesday', action: 'Perform 1 orange Tavern Quest', basePoints: 75000.0, buff: null, unit: 1.0 },
  { day: 'Tuesday', action: 'Use 1-minute Building Speed Up', basePoints: 50.0, buff: 'Accelerator Motivation', unit: 1.0 },
  { day: 'Tuesday', action: 'Increase Building CP by 1', basePoints: 10.0, buff: 'Construction Motivation', unit: 1.0 },
  { day: 'Tuesday', action: 'Perform 1 Survivor Recruitment', basePoints: 1500.0, buff: null, unit: 1.0 },
  // Wednesday
  { day: 'Wednesday', action: 'Increase technology CP by 1', basePoints: 10.0, buff: 'Research Motivation', unit: 1.0 },
  { day: 'Wednesday', action: 'Complete 1 Intelligence Quest', basePoints: 10000.0, buff: 'Intelligence Motivation', unit: 1.0 },
  { day: 'Wednesday', action: 'Use 1-Minute Technology Speedup', basePoints: 50.0, buff: 'Accelerator Motivation', unit: 1.0 },
  { day: 'Wednesday', action: 'Use 1 Energy Crystal', basePoints: 300.0, buff: null, unit: 1.0 },
  { day: 'Wednesday', action: 'Open 1 Lv. 1-7 Mystic Beast Mark Chest', basePoints: 1100.0, buff: null, unit: 1.0 },
  // Thursday (Hero Dev - assumed typical)
  { day: 'Thursday', action: 'Spend 1 Super Recruitment Token', basePoints: 40000, buff: null, unit: 1.0 },
  { day: 'Thursday', action: 'Use Hero EXP (1000)', basePoints: 2.0, buff: null, unit: 1.0 },
  { day: 'Thursday', action: 'Hero Upgrade (CP +1)', basePoints: 20, buff: null, unit: 1.0 },
  // Friday (Unit training - assumed typical)
  { day: 'Friday', action: 'Train 1 T10 Unit', basePoints: 150, buff: 'Training Motivation', unit: 1.0 },
  { day: 'Friday', action: 'Train 1 T9 Unit', basePoints: 100, buff: 'Training Motivation', unit: 1.0 },
  { day: 'Friday', action: 'Train 1 T8 Unit', basePoints: 70, buff: 'Training Motivation', unit: 1.0 },
  { day: 'Friday', action: 'Use 1-Min Training Speedup', basePoints: 50, buff: 'Accelerator Motivation', unit: 1.0 },
  // Saturday/Sunday (Variety / Kill)
  { day: 'Saturday', action: 'Defeat 1 Enemy Unit', basePoints: 1, buff: 'Enemy Kill Motivation', unit: 1.0 },
  { day: 'Sunday', action: 'Defeat 1 Enemy Unit', basePoints: 1, buff: 'Enemy Kill Motivation', unit: 1.0 }
];

export const ACTIONS: ActionData[] = RAW_ACTIONS.map((a, idx) => ({
  ...a,
  id: `${a.day}-${idx}`
}));
