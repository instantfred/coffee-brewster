export type MethodKey = 'v60' | 'chemex' | 'aeropress' | 'french_press' | 'moka';

export interface BrewMethod {
  key: MethodKey;
  defaultRatio: number;
  bloom: boolean;
  pours: number;
}

export interface PourStep {
  atSec: number;
  volumeMl: number;
  label: string;
}

export interface BrewPlan {
  coffeeGrams: number;
  waterTotalMl: number;
  yieldTargetMl: number;
  bloomMl?: number;
  pours: PourStep[];
  tempC: number;
  grind: string;
  filter: string;
}

const ABS_COEF: Record<MethodKey, number> = {
  v60: 2.0,
  chemex: 2.0,
  aeropress: 1.5,
  french_press: 2.2,
  moka: 0.8,
};

const TEMP_RANGES: Record<MethodKey, number> = {
  v60: 94,
  chemex: 94,
  aeropress: 85,
  french_press: 95,
  moka: 98,
};

const GRIND_SUGGESTIONS: Record<MethodKey, string> = {
  v60: 'Medium-fine',
  chemex: 'Medium-coarse',
  aeropress: 'Medium',
  french_press: 'Coarse',
  moka: 'Fine-medium',
};

const FILTER_SUGGESTIONS: Record<MethodKey, string> = {
  v60: 'V60 paper',
  chemex: 'Chemex paper',
  aeropress: 'Paper or metal',
  french_press: 'Metal mesh',
  moka: 'Basket',
};

export function planBrew({
  method,
  cups,
  cupSizeMl,
  ratio,
  targetYieldMl,
}: {
  method: BrewMethod;
  cups: number;
  cupSizeMl: number;
  ratio?: number;
  targetYieldMl?: number;
}): BrewPlan {
  const yieldTargetMl = Math.round(targetYieldMl ?? cups * cupSizeMl);
  const R = ratio ?? method.defaultRatio;
  const coffee = +(yieldTargetMl / R).toFixed(1);
  const absorption = +(coffee * ABS_COEF[method.key]).toFixed(0);
  const waterTotal = yieldTargetMl + absorption;
  const schedule: PourStep[] = [];

  let bloomMl: number | undefined;

  if (method.bloom) {
    bloomMl = Math.min(Math.max(2 * coffee, 30), 60);
    schedule.push({
      atSec: 0,
      volumeMl: Math.round(bloomMl),
      label: 'Bloom',
    });
  }

  const remaining = waterTotal - (bloomMl ?? 0);

  if (method.key === 'v60') {
    schedule.push({
      atSec: 45,
      volumeMl: Math.round(remaining * 0.55),
      label: 'First pour',
    });
    schedule.push({
      atSec: 105,
      volumeMl: Math.round(remaining * 0.45),
      label: 'Second pour',
    });
  } else if (method.key === 'chemex') {
    schedule.push({
      atSec: 45,
      volumeMl: Math.round(remaining * 0.4),
      label: 'First pour',
    });
    schedule.push({
      atSec: 105,
      volumeMl: Math.round(remaining * 0.3),
      label: 'Second pour',
    });
    schedule.push({
      atSec: 165,
      volumeMl: Math.round(remaining * 0.3),
      label: 'Third pour',
    });
  } else if (method.key === 'aeropress') {
    schedule.push({
      atSec: 45,
      volumeMl: remaining,
      label: 'Fill & steep',
    });
  } else if (method.key === 'french_press') {
    schedule.push({
      atSec: 0,
      volumeMl: waterTotal,
      label: 'Fill',
    });
  } else if (method.key === 'moka') {
    schedule.push({
      atSec: 0,
      volumeMl: waterTotal,
      label: 'Assemble & heat',
    });
  }

  return {
    coffeeGrams: coffee,
    waterTotalMl: waterTotal,
    yieldTargetMl,
    bloomMl,
    pours: schedule,
    tempC: TEMP_RANGES[method.key],
    grind: GRIND_SUGGESTIONS[method.key],
    filter: FILTER_SUGGESTIONS[method.key],
  };
}