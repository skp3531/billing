const fs = require('fs');
let content = fs.readFileSync('server/src/middleware/requireOutletAccess.ts', 'utf8');

content += `

export const assertOutletAccess = (outletId: string, user: any): boolean => {
  if (!user || !user.outletIds) return false;
  
  // OWNER can access all, but outletIds should already be populated for owner.
  // We strictly check if the requested outletId exists in user's allowed outletIds.
  return user.outletIds.includes(outletId.toString());
};
`;

fs.writeFileSync('server/src/middleware/requireOutletAccess.ts', content);
