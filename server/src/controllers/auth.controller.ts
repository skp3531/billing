import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { Organization } from '../models/Organization';
import { Outlet } from '../models/Outlet';
import { Role } from '../models/Role';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { successResponse, errorResponse } from '../utils/apiResponse';
import { createAuditLog } from '../utils/auditLog';
import { RefreshToken } from '../models/RefreshToken';
import crypto from 'crypto';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+passwordHash').populate<{ roleId: any }>('roleId');
  if (!user || !user.active) {
    return errorResponse(res, 'Invalid credentials', 401);
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return errorResponse(res, 'Invalid credentials', 401);
  }

  const role = user.roleId;
  const organization = await Organization.findById(user.organizationId);
  const outlets = await Outlet.find({ _id: { $in: user.outletIds } });

  const accessToken = signAccessToken({
    userId: user.id,
    organizationId: user.organizationId.toString(),
    roleId: role.id,
    roleName: role.name,
    permissions: role.permissions || [],
    outletIds: (user.outletIds || []).map((id: any) => id.toString()),
  });

  const refreshToken = signRefreshToken({
    userId: user.id,
    organizationId: user.organizationId.toString(),
  });

  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await RefreshToken.create({ tokenHash, userId: user.id, expiresAt });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  await createAuditLog({
    organizationId: user.organizationId.toString(),
    userId: user.id,
    userName: user.name,
    action: 'user.login',
    entity: 'User',
    entityId: user.id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  user.lastLogin = new Date();
  await user.save();

  const userObj = user.toObject();
  delete (userObj as any).passwordHash;

  return successResponse(res, {
    accessToken,
    user: {
      ...userObj,
      roleName: role.name,
      permissions: role.permissions,
    },
    organization,
    currentOutlet: outlets[0] || null,
  });
};

export const logout = async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  if (token) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    await RefreshToken.deleteOne({ tokenHash });
  }
  res.clearCookie('refreshToken');
  return successResponse(res, null, 'Logged out successfully');
};

export const refresh = async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  if (!token) return errorResponse(res, 'No refresh token', 401);

  try {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const storedToken = await RefreshToken.findOne({ tokenHash });
    if (!storedToken) {
      throw new Error('Token revoked or not found');
    }

    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.userId).populate<{ roleId: any }>('roleId');
    if (!user || !user.active) throw new Error();

    const accessToken = signAccessToken({
      userId: user.id,
      organizationId: user.organizationId.toString(),
      roleId: user.roleId.id,
      roleName: user.roleId.name,
      permissions: user.roleId.permissions || [],
      outletIds: (user.outletIds || []).map((id: any) => id.toString()),
    });

    // Rotate refresh token
    const newRefreshToken = signRefreshToken({
      userId: user.id,
      organizationId: user.organizationId.toString(),
    });
    const newTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
    
    // Replace old token with new one
    storedToken.tokenHash = newTokenHash;
    storedToken.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await storedToken.save();

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return successResponse(res, { accessToken });
  } catch (error) {
    return errorResponse(res, 'Invalid refresh token', 401);
  }
};

export const getMe = async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.userId)
    .populate('roleId')
    .populate('outletIds');
  return successResponse(res, user);
};
