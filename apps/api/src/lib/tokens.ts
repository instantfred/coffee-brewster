import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export const generateAccessToken = (userId: string): string => {
  return jwt.sign({ userId }, env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

export const verifyToken = (token: string): { userId: string } => {
  return jwt.verify(token, env.JWT_SECRET) as { userId: string };
};