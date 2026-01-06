import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/error';
import { updateSettingsSchema } from '../../schemas/settings.schema';

export const getSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }
    const settings = await prisma.settings.findUnique({
      where: { userId: req.user.id },
      select: {
        units: true,
        tempUnit: true,
        waterUnitPreference: true,
        recommend: true,
        defaultMethodId: true,
        cupSizeMl: true,
        soundEnabled: true,
      },
    });

    if (!settings) {
      throw new AppError('Settings not found', 404);
    }

    res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }
    const updates = updateSettingsSchema.parse(req.body);

    // If defaultMethodId is provided, verify it exists
    if (updates.defaultMethodId) {
      const method = await prisma.brewMethod.findUnique({
        where: { id: updates.defaultMethodId },
      });

      if (!method) {
        throw new AppError('Invalid default method ID', 400);
      }
    }

    const settings = await prisma.settings.upsert({
      where: { userId: req.user.id },
      update: updates,
      create: {
        userId: req.user.id,
        units: updates.units || 'METRIC',
        tempUnit: updates.tempUnit || 'C',
        waterUnitPreference: updates.waterUnitPreference || 'ml',
        recommend: updates.recommend ?? true,
        defaultMethodId: updates.defaultMethodId,
        cupSizeMl: updates.cupSizeMl || 240,
        soundEnabled: updates.soundEnabled ?? true,
      },
      select: {
        units: true,
        tempUnit: true,
        waterUnitPreference: true,
        recommend: true,
        defaultMethodId: true,
        cupSizeMl: true,
        soundEnabled: true,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      settings,
    });
  } catch (error) {
    next(error);
  }
};