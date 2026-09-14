const fs = require('fs');

let content = fs.readFileSync('server/src/controllers/auth.controller.ts', 'utf8');

content = content.replace(
  "import { createAuditLog } from '../utils/auditLog';",
  "import { createAuditLog } from '../utils/auditLog';\nimport { RefreshToken } from '../models/RefreshToken';\nimport crypto from 'crypto';"
);

// In login:
content = content.replace(
  /const refreshToken = signRefreshToken\(\{[\s\S]*?\}\);\s*res\.cookie\('refreshToken'/m,
  `const refreshToken = signRefreshToken({
    userId: user.id,
    organizationId: user.organizationId.toString(),
  });

  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await RefreshToken.create({ tokenHash, userId: user.id, expiresAt });

  res.cookie('refreshToken'`
);

// In logout:
content = content.replace(
  /export const logout = async \(req: Request, res: Response\) => \{\s*res\.clearCookie\('refreshToken'\);/m,
  `export const logout = async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  if (token) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    await RefreshToken.deleteOne({ tokenHash });
  }
  res.clearCookie('refreshToken');`
);

// In refresh:
content = content.replace(
  /export const refresh = async \(req: Request, res: Response\) => \{[\s\S]*?const user = await User\.findById\(decoded\.userId\)\.populate<\{\s*roleId: any\s*\}>\('roleId'\);/m,
  `export const refresh = async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  if (!token) return errorResponse(res, 'No refresh token', 401);

  try {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const storedToken = await RefreshToken.findOne({ tokenHash });
    if (!storedToken) {
      throw new Error('Token revoked or not found');
    }

    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.userId).populate<{ roleId: any }>('roleId');`
);

// Add refresh token rotation to refresh:
content = content.replace(
  /return successResponse\(res, \{ accessToken \}\);/m,
  `// Rotate refresh token
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

    return successResponse(res, { accessToken });`
);

fs.writeFileSync('server/src/controllers/auth.controller.ts', content);
