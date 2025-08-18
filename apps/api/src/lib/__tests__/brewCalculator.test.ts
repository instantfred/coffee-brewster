import { planBrew, MethodKey, BrewMethod } from '../brewCalculator';

describe('brewCalculator', () => {
  const mockV60Method: BrewMethod = {
    key: 'v60',
    defaultRatio: 15,
    bloom: true,
    pours: 2,
  };

  const mockChemexMethod: BrewMethod = {
    key: 'chemex',
    defaultRatio: 16,
    bloom: true,
    pours: 3,
  };

  const mockAeropressMethod: BrewMethod = {
    key: 'aeropress',
    defaultRatio: 14,
    bloom: true,
    pours: 0,
  };

  const mockFrenchPressMethod: BrewMethod = {
    key: 'french_press',
    defaultRatio: 15,
    bloom: false,
    pours: 0,
  };

  const mockMokaMethod: BrewMethod = {
    key: 'moka',
    defaultRatio: 10,
    bloom: false,
    pours: 0,
  };

  describe('planBrew', () => {
    it('should calculate basic V60 recipe correctly', () => {
      const result = planBrew({
        method: mockV60Method,
        cups: 2,
        cupSizeMl: 240,
      });

      expect(result.yieldTargetMl).toBe(480);
      expect(result.coffeeGrams).toBe(32);
      expect(result.waterTotalMl).toBe(544); // 480 + (32 * 2.0 absorption)
      expect(result.pours).toHaveLength(3); // bloom + 2 pours
      expect(result.pours[0].label).toBe('Bloom');
      expect(result.tempC).toBe(94);
      expect(result.grind).toBe('Medium-fine');
    });

    it('should handle custom ratio override', () => {
      const result = planBrew({
        method: mockV60Method,
        cups: 1,
        cupSizeMl: 240,
        ratio: 12, // stronger than default 15
      });

      expect(result.coffeeGrams).toBe(20); // 240/12 = 20
      expect(result.waterTotalMl).toBe(280); // 240 + (20 * 2.0)
    });

    it('should handle custom target yield', () => {
      const result = planBrew({
        method: mockV60Method,
        cups: 2,
        cupSizeMl: 240,
        targetYieldMl: 400, // override cups * cupSize
      });

      expect(result.yieldTargetMl).toBe(400);
      expect(result.coffeeGrams).toBe(26.7); // 400/15
    });

    it('should calculate Chemex recipe with 3 pours', () => {
      const result = planBrew({
        method: mockChemexMethod,
        cups: 2,
        cupSizeMl: 240,
      });

      expect(result.pours).toHaveLength(4); // bloom + 3 pours
      expect(result.pours[1].label).toBe('First pour');
      expect(result.pours[2].label).toBe('Second pour');
      expect(result.pours[3].label).toBe('Third pour');
      expect(result.grind).toBe('Medium-coarse');
    });

    it('should calculate AeroPress recipe with single fill', () => {
      const result = planBrew({
        method: mockAeropressMethod,
        cups: 1,
        cupSizeMl: 240,
      });

      expect(result.pours).toHaveLength(2); // bloom + fill
      expect(result.pours[1].label).toBe('Fill & steep');
      expect(result.tempC).toBe(85);
    });

    it('should calculate French Press without bloom', () => {
      const result = planBrew({
        method: mockFrenchPressMethod,
        cups: 2,
        cupSizeMl: 240,
      });

      expect(result.bloomMl).toBeUndefined();
      expect(result.pours).toHaveLength(1); // just fill
      expect(result.pours[0].label).toBe('Fill');
      expect(result.pours[0].atSec).toBe(0);
    });

    it('should calculate Moka Pot recipe', () => {
      const result = planBrew({
        method: mockMokaMethod,
        cups: 1,
        cupSizeMl: 240,
      });

      expect(result.coffeeGrams).toBe(24); // 240/10
      expect(result.waterTotalMl).toBe(259); // 240 + (24 * 0.8 absorption)
      expect(result.pours[0].label).toBe('Assemble & heat');
      expect(result.grind).toBe('Fine-medium');
    });

    it('should calculate bloom volume correctly', () => {
      const smallResult = planBrew({
        method: mockV60Method,
        cups: 0.5,
        cupSizeMl: 120, // small brew
      });

      const largeResult = planBrew({
        method: mockV60Method,
        cups: 4,
        cupSizeMl: 240, // large brew
      });

      // Bloom should be between 30-60ml
      expect(smallResult.bloomMl).toBeGreaterThanOrEqual(30);
      expect(largeResult.bloomMl).toBeLessThanOrEqual(60);
    });

    it('should distribute pour volumes correctly for V60', () => {
      const result = planBrew({
        method: mockV60Method,
        cups: 2,
        cupSizeMl: 240,
      });

      const bloomVol = result.pours[0].volumeMl;
      const firstPour = result.pours[1].volumeMl;
      const secondPour = result.pours[2].volumeMl;

      expect(bloomVol + firstPour + secondPour).toBe(result.waterTotalMl);
      
      // First pour should be ~55% of remaining water after bloom
      const remaining = result.waterTotalMl - bloomVol;
      expect(firstPour).toBeCloseTo(remaining * 0.55, 0);
    });
  });
});