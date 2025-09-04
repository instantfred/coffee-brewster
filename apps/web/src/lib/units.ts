import { UserSettings } from './api';

// Weight conversions
export const gToOz = (g: number): number => +(g / 28.3495).toFixed(2);
export const ozToG = (oz: number): number => +(oz * 28.3495).toFixed(1);

// Volume conversions
export const mlToOz = (ml: number): number => +(ml / 29.5735).toFixed(2);
export const ozToMl = (oz: number): number => +(oz * 29.5735).toFixed(0);

// Temperature conversions
export const cToF = (c: number): number => Math.round(c * 9/5 + 32);
export const fToC = (f: number): number => Math.round((f - 32) * 5/9);

// Format functions that respect user settings
export const formatWeight = (grams: number, settings: UserSettings): string => {
  if (settings.units === 'IMPERIAL') {
    return `${gToOz(grams)} oz`;
  }
  return `${grams} g`;
};

export const formatVolume = (ml: number, settings: UserSettings): string => {
  // Check if user prefers to see water in grams
  if (settings.waterUnitPreference === 'g') {
    return `${ml} g`; // 1ml water ≈ 1g
  }
  
  if (settings.units === 'IMPERIAL') {
    return `${mlToOz(ml)} fl oz`;
  }
  return `${ml} ml`;
};

export const formatTemperature = (celsius: number, settings: UserSettings): string => {
  if (settings.tempUnit === 'F') {
    return `${cToF(celsius)}°F`;
  }
  return `${celsius}°C`;
};

// Parse functions for user input (converts back to metric for storage)
export const parseWeight = (value: string, settings: UserSettings): number => {
  const num = parseFloat(value);
  if (isNaN(num)) return 0;
  
  if (settings.units === 'IMPERIAL') {
    return ozToG(num);
  }
  return num;
};

export const parseVolume = (value: string, settings: UserSettings): number => {
  const num = parseFloat(value);
  if (isNaN(num)) return 0;
  
  // If water unit preference is grams, treat it as 1:1 with ml
  if (settings.waterUnitPreference === 'g') {
    return num; // 1g water ≈ 1ml
  }
  
  if (settings.units === 'IMPERIAL') {
    return ozToMl(num);
  }
  return num;
};

export const parseTemperature = (value: string, settings: UserSettings): number => {
  const num = parseFloat(value);
  if (isNaN(num)) return 0;
  
  if (settings.tempUnit === 'F') {
    return fToC(num);
  }
  return num;
};

// Display values for input fields (converts from metric storage to user preference)
export const displayWeight = (grams: number, settings: UserSettings): number => {
  if (settings.units === 'IMPERIAL') {
    return gToOz(grams);
  }
  return grams;
};

export const displayVolume = (ml: number, settings: UserSettings): number => {
  // Water preference doesn't affect display value (1ml = 1g)
  if (settings.units === 'IMPERIAL') {
    return mlToOz(ml);
  }
  return ml;
};

export const displayTemperature = (celsius: number, settings: UserSettings): number => {
  if (settings.tempUnit === 'F') {
    return cToF(celsius);
  }
  return celsius;
};

// Unit labels for UI
export const getWeightUnit = (settings: UserSettings): string => {
  return settings.units === 'IMPERIAL' ? 'oz' : 'g';
};

export const getVolumeUnit = (settings: UserSettings): string => {
  // Check water unit preference first
  if (settings.waterUnitPreference === 'g') {
    return 'g';
  }
  return settings.units === 'IMPERIAL' ? 'fl oz' : 'ml';
};

export const getTemperatureUnit = (settings: UserSettings): string => {
  return settings.tempUnit === 'F' ? '°F' : '°C';
};

// Helper to get cup size in user's preferred units
export const formatCupSize = (cupSizeMl: number, settings: UserSettings): string => {
  if (settings.units === 'IMPERIAL') {
    return `${mlToOz(cupSizeMl)} fl oz`;
  }
  return `${cupSizeMl} ml`;
};

// Water-specific formatting functions
export const formatWater = (ml: number, settings: UserSettings): string => {
  return formatVolume(ml, settings);
};

export const getWaterUnit = (settings: UserSettings): string => {
  return getVolumeUnit(settings);
};

export const displayWater = (ml: number, settings: UserSettings): number => {
  return displayVolume(ml, settings);
};

export const parseWater = (value: string, settings: UserSettings): number => {
  return parseVolume(value, settings);
};
