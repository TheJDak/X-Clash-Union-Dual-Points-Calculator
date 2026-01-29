
export type Day = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export type RoundingMode = 'none' | 'floor' | 'round' | 'ceil';

export interface ActionData {
  id: string;
  day: Day;
  action: string;
  basePoints: number;
  buff: string | null;
  unit: number;
}

export interface ResearchLevels {
  [key: string]: number;
}

export interface Speedups {
  s8h: number;
  s3h: number;
  s1h: number;
  s15m: number;
  s5m: number;
  s1m: number;
}

export interface AppState {
  activeTab: 'research' | 'calculator' | 'speedups';
  selectedDay: Day;
  roundingMode: RoundingMode;
  research: ResearchLevels;
  quantities: Record<string, number>;
  speedups: Speedups;
}
