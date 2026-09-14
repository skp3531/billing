const fs = require('fs');

let jwtContent = fs.readFileSync('server/src/utils/jwt.ts', 'utf8');
jwtContent = jwtContent.replace(
  "userId: string;",
  "userId: string;\n  userName: string;"
);
fs.writeFileSync('server/src/utils/jwt.ts', jwtContent);

let authContent = fs.readFileSync('server/src/controllers/auth.controller.ts', 'utf8');
authContent = authContent.replace(
  /userId: user\.id,\n    organizationId/g,
  "userId: user.id,\n    userName: user.name,\n    organizationId"
);
fs.writeFileSync('server/src/controllers/auth.controller.ts', authContent);
