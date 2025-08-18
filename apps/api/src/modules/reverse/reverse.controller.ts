import { Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/error';
import { reverseBrewSchema } from '../../schemas/reverse.schema';
import { planBrew } from '../../lib/brewCalculator';
import { AuthenticatedRequest } from '../../middleware/auth';

export const calculateReverseBrew = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { methodKey, cups, ratio, targetYieldMl } = reverseBrewSchema.parse(
      req.body
    );

    // Get user settings for cup size preference
    const userSettings = await prisma.settings.findUnique({
      where: { userId: req.user!.id },
      select: {
        cupSizeMl: true,
        recommend: true,
      },
    });

    const cupSizeMl = userSettings?.cupSizeMl ?? 240;
    const showRecommendations = userSettings?.recommend ?? true;

    // Get brew method details
    const method = await prisma.brewMethod.findUnique({
      where: { key: methodKey },
      select: {
        key: true,
        defaultRatio: true,
        bloom: true,
        pours: true,
      },
    });

    if (!method) {
      throw new AppError('Brew method not found', 404);
    }

    // Calculate the brew plan
    const brewPlan = planBrew({
      method: {
        key: method.key as any,
        defaultRatio: method.defaultRatio,
        bloom: method.bloom,
        pours: method.pours,
      },
      cups,
      cupSizeMl,
      ratio,
      targetYieldMl,
    });

    // Prepare response - hide recommendations if user has disabled them
    const response = {
      coffeeGrams: brewPlan.coffeeGrams,
      waterTotalMl: brewPlan.waterTotalMl,
      yieldTargetMl: brewPlan.yieldTargetMl,
      bloomMl: brewPlan.bloomMl,
      pours: brewPlan.pours,
      ...(showRecommendations && {
        tempC: brewPlan.tempC,
        grind: brewPlan.grind,
        filter: brewPlan.filter,
      }),
    };

    res.status(200).json({
      success: true,
      recipe: response,
      showRecommendations,
    });
  } catch (error) {
    next(error);
  }
};