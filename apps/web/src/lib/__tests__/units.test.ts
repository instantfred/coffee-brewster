import { describe, it, expect } from 'vitest';
import {
  gToOz,
  ozToG,
  mlToOz,
  ozToMl,
  cToF,
  fToC,
  formatWeight,
  formatVolume,
  formatTemperature,
  parseWeight,
  parseVolume,
  displayWeight,
  displayVolume,
  getWeightUnit,
  getVolumeUnit,
  getTemperatureUnit,
} from '../units';
import type { UserSettings } from '../api';

describe('units', () => {
  const metricSettings: UserSettings = {
    id: '1',
    userId: '1',
    units: 'METRIC',
    tempUnit: 'C',
    recommend: true,
    cupSizeMl: 240,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const imperialSettings: UserSettings = {
    id: '2',
    userId: '1',
    units: 'IMPERIAL',
    tempUnit: 'F',
    recommend: true,
    cupSizeMl: 240,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('gToOz', () => {
    it('should convert grams to ounces correctly', () => {
      expect(gToOz(100)).toBeCloseTo(3.53, 2);
      expect(gToOz(28.35)).toBeCloseTo(1, 1);
    });
  });

  describe('ozToG', () => {
    it('should convert ounces to grams correctly', () => {
      expect(ozToG(3.53)).toBeCloseTo(100, 0);
      expect(ozToG(1)).toBeCloseTo(28.3, 1);
    });
  });

  describe('mlToOz', () => {
    it('should convert ml to fl oz correctly', () => {
      expect(mlToOz(240)).toBeCloseTo(8.12, 2);
      expect(mlToOz(29.57)).toBeCloseTo(1, 1);
    });
  });

  describe('ozToMl', () => {
    it('should convert fl oz to ml correctly', () => {
      expect(ozToMl(8)).toBeCloseTo(237, 0);
      expect(ozToMl(1)).toBeCloseTo(30, 0);
    });
  });

  describe('cToF', () => {
    it('should convert Celsius to Fahrenheit correctly', () => {
      expect(cToF(94)).toBe(201);
      expect(cToF(0)).toBe(32);
      expect(cToF(100)).toBe(212);
    });
  });

  describe('fToC', () => {
    it('should convert Fahrenheit to Celsius correctly', () => {
      expect(fToC(201)).toBe(94);
      expect(fToC(32)).toBe(0);
      expect(fToC(212)).toBe(100);
    });
  });

  describe('formatWeight', () => {
    it('should format metric weights correctly', () => {
      expect(formatWeight(30, metricSettings)).toBe('30 g');
      expect(formatWeight(30.5, metricSettings)).toBe('30.5 g');
    });

    it('should format imperial weights correctly', () => {
      expect(formatWeight(28.35, imperialSettings)).toBe('1 oz');
      expect(formatWeight(100, imperialSettings)).toBe('3.53 oz');
    });
  });

  describe('formatVolume', () => {
    it('should format metric volumes correctly', () => {
      expect(formatVolume(240, metricSettings)).toBe('240 ml');
      expect(formatVolume(240.5, metricSettings)).toBe('240.5 ml');
    });

    it('should format imperial volumes correctly', () => {
      expect(formatVolume(240, imperialSettings)).toBe('8.12 fl oz');
      expect(formatVolume(29.57, imperialSettings)).toBe('1 fl oz');
    });
  });

  describe('formatTemperature', () => {
    it('should format Celsius temperatures correctly', () => {
      expect(formatTemperature(94, metricSettings)).toBe('94°C');
      expect(formatTemperature(100, metricSettings)).toBe('100°C');
    });

    it('should format Fahrenheit temperatures correctly', () => {
      expect(formatTemperature(94, imperialSettings)).toBe('201°F');
      expect(formatTemperature(100, imperialSettings)).toBe('212°F');
    });
  });

  describe('parseWeight', () => {
    it('should parse metric weights correctly', () => {
      expect(parseWeight('30', metricSettings)).toBe(30);
      expect(parseWeight('30.5', metricSettings)).toBe(30.5);
    });

    it('should parse imperial weights correctly', () => {
      expect(parseWeight('1', imperialSettings)).toBeCloseTo(28.3, 1);
      expect(parseWeight('3.53', imperialSettings)).toBeCloseTo(100, 0);
    });

    it('should handle invalid input', () => {
      expect(parseWeight('invalid', metricSettings)).toBe(0);
      expect(parseWeight('', metricSettings)).toBe(0);
    });
  });

  describe('parseVolume', () => {
    it('should parse metric volumes correctly', () => {
      expect(parseVolume('240', metricSettings)).toBe(240);
      expect(parseVolume('240.5', metricSettings)).toBe(240.5);
    });

    it('should parse imperial volumes correctly', () => {
      expect(parseVolume('8', imperialSettings)).toBeCloseTo(237, 0);
      expect(parseVolume('1', imperialSettings)).toBeCloseTo(30, 0);
    });
  });

  describe('displayWeight', () => {
    it('should display metric weights correctly', () => {
      expect(displayWeight(30, metricSettings)).toBe(30);
    });

    it('should display imperial weights correctly', () => {
      expect(displayWeight(100, imperialSettings)).toBeCloseTo(3.53, 2);
    });
  });

  describe('displayVolume', () => {
    it('should display metric volumes correctly', () => {
      expect(displayVolume(240, metricSettings)).toBe(240);
    });

    it('should display imperial volumes correctly', () => {
      expect(displayVolume(240, imperialSettings)).toBeCloseTo(8.12, 2);
    });
  });

  describe('getWeightUnit', () => {
    it('should return correct weight units', () => {
      expect(getWeightUnit(metricSettings)).toBe('g');
      expect(getWeightUnit(imperialSettings)).toBe('oz');
    });
  });

  describe('getVolumeUnit', () => {
    it('should return correct volume units', () => {
      expect(getVolumeUnit(metricSettings)).toBe('ml');
      expect(getVolumeUnit(imperialSettings)).toBe('fl oz');
    });
  });

  describe('getTemperatureUnit', () => {
    it('should return correct temperature units', () => {
      expect(getTemperatureUnit(metricSettings)).toBe('°C');
      expect(getTemperatureUnit(imperialSettings)).toBe('°F');
    });
  });
});