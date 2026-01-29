
import { RoundingMode } from '../types';

export const NF = new Intl.NumberFormat('en-US');

export const calculatePoints = (
  qty: number,
  basePoints: number,
  unit: number,
  allPointsLevel: number,
  specificBuffLevel: number,
  mode: RoundingMode
) => {
  const baseValue = (qty / unit) * basePoints;
  const multiplier = 1 + (allPointsLevel * 0.05) + (specificBuffLevel * 0.05);
  const rawResult = baseValue * multiplier;

  switch (mode) {
    case 'floor': return Math.floor(rawResult);
    case 'round': return Math.round(rawResult);
    case 'ceil': return Math.ceil(rawResult);
    default: return rawResult;
  }
};

export const formatNum = (n: number) => NF.format(n);
