const fs = require('fs');
let content = fs.readFileSync('server/src/controllers/auth.controller.ts', 'utf8');

content = content.replace(
  "  const refreshToken = signRefreshToken({\n    userId: user.id,\n    userName: user.name,\n    organizationId: user.organizationId.toString(),\n  });",
  "  const refreshToken = signRefreshToken({\n    userId: user.id,\n    organizationId: user.organizationId.toString(),\n  });"
);

content = content.replace(
  /signAccessToken\(\{\n\s*userId: user.id,\n\s*organizationId:/g,
  "signAccessToken({\n      userId: user.id,\n      userName: user.name,\n      organizationId:"
);

fs.writeFileSync('server/src/controllers/auth.controller.ts', content);
