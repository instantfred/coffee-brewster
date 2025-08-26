import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/error';
import { AuthenticatedRequest } from '../../middleware/auth';

export const getMethods = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get user's settings to determine if recommendations should be shown
    let showRecommendations = true;
    
    if (req.user) {
      const userSettings = await prisma.settings.findUnique({
        where: { userId: req.user.id },
        select: { recommend: true },
      });
      showRecommendations = userSettings?.recommend ?? true;
    }

    const methods = await prisma.brewMethod.findMany({
      select: {
        id: true,
        key: true,
        name: true,
        defaultRatio: true,
        bloom: true,
        pours: true,
        notes: true,
        presets: showRecommendations, // Only include presets if user wants recommendations
      },
      orderBy: { name: 'asc' },
    });

    // If recommendations are disabled, filter out preset details from the presets field
    const filteredMethods = methods.map(method => ({
      ...method,
      presets: showRecommendations ? method.presets : null,
    }));

    res.status(200).json({
      success: true,
      methods: filteredMethods,
      showRecommendations,
    });
  } catch (error) {
    next(error);
  }
};

export const getMethodByKey = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { key } = req.params;

    let showRecommendations = true;

    // If user is authenticated, check their recommendation preference
    if (req.user) {
      const userSettings = await prisma.settings.findUnique({
        where: { userId: req.user.id },
        select: { recommend: true },
      });
      showRecommendations = userSettings?.recommend ?? true;
    }

    const method = await prisma.brewMethod.findUnique({
      where: { key },
      select: {
        id: true,
        key: true,
        name: true,
        defaultRatio: true,
        bloom: true,
        pours: true,
        notes: true,
        presets: true,
      },
    });

    if (!method) {
      throw new AppError('Brew method not found', 404);
    }

    // Filter presets based on user preference
    const filteredMethod = {
      ...method,
      presets: showRecommendations ? method.presets : null,
    };

    res.status(200).json({
      success: true,
      method: filteredMethod,
      showRecommendations,
    });
  } catch (error) {
    next(error);
  }
};