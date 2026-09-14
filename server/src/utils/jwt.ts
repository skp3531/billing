import jwt, { SignOptions } from 'jsonwebtoken';
import env from '../config/env';

export interface AccessTokenPayload {
  userId: string;
  userName: string;
  organizationId: string;
  roleId: string;
  roleName: string;
  permissions: string[];
  outletIds: string[];
}

export interface RefreshTokenPayload {
  userId: string;
  organizationId: string;
}

export const signAccessToken = (payload: AccessTokenPayload): string => {
  const options: SignOptions = { expiresIn: env.JWT_ACCESS_EXPIRES as SignOptions['expiresIn'] };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, options);
};

export const signRefreshToken = (payload: RefreshTokenPayload): string => {
  const options: SignOptions = { expiresIn: env.JWT_REFRESH_EXPIRES as SignOptions['expiresIn'] };
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, options);
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
};
