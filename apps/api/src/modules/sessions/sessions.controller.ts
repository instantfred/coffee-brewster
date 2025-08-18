import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/error';
import {
  createSessionSchema,
  updateSessionSchema,
  getSessionsQuerySchema,
} from '../../schemas/sessions.schema';
import { AuthenticatedRequest } from '../../middleware/auth';

export const getSessions = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page, limit, q, methodId } = getSessionsQuerySchema.parse(req.query);

    const skip = (page - 1) * limit;

    // Build where clause for search and filters
    const where: any = {
      userId: req.user!.id,
    };

    if (methodId) {
      where.methodId = methodId;
    }

    if (q) {
      where.OR = [
        { notes: { contains: q, mode: 'insensitive' } },
        { grindSetting: { contains: q, mode: 'insensitive' } },
        { method: { name: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const [sessions, total] = await Promise.all([
      prisma.brewSession.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startedAt: 'desc' },
        include: {
          method: {
            select: {
              name: true,
              key: true,
            },
          },
        },
      }),
      prisma.brewSession.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      sessions,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getSession = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const session = await prisma.brewSession.findFirst({
      where: {
        id,
        userId: req.user!.id, // Ensure ownership
      },
      include: {
        method: {
          select: {
            name: true,
            key: true,
          },
        },
      },
    });

    if (!session) {
      throw new AppError('Session not found', 404);
    }

    res.status(200).json({
      success: true,
      session,
    });
  } catch (error) {
    next(error);
  }
};

export const createSession = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const sessionData = createSessionSchema.parse(req.body);

    // Verify method exists
    const method = await prisma.brewMethod.findUnique({
      where: { id: sessionData.methodId },
    });

    if (!method) {
      throw new AppError('Invalid method ID', 400);
    }

    const session = await prisma.brewSession.create({
      data: {
        ...sessionData,
        userId: req.user!.id,
      },
      include: {
        method: {
          select: {
            name: true,
            key: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Session created successfully',
      session,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSession = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const updates = updateSessionSchema.parse(req.body);

    // Verify ownership
    const existingSession = await prisma.brewSession.findFirst({
      where: {
        id,
        userId: req.user!.id,
      },
    });

    if (!existingSession) {
      throw new AppError('Session not found', 404);
    }

    // If methodId is being updated, verify it exists
    if (updates.methodId) {
      const method = await prisma.brewMethod.findUnique({
        where: { id: updates.methodId },
      });

      if (!method) {
        throw new AppError('Invalid method ID', 400);
      }
    }

    const session = await prisma.brewSession.update({
      where: { id },
      data: updates,
      include: {
        method: {
          select: {
            name: true,
            key: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Session updated successfully',
      session,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSession = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    // Verify ownership and delete
    const deletedSession = await prisma.brewSession.deleteMany({
      where: {
        id,
        userId: req.user!.id,
      },
    });

    if (deletedSession.count === 0) {
      throw new AppError('Session not found', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Session deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};