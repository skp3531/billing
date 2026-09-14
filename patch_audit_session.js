const fs = require('fs');
let content = fs.readFileSync('server/src/utils/auditLog.ts', 'utf8');

content = content.replace(
  "import { AuditLog } from '../models/AuditLog';",
  "import { AuditLog } from '../models/AuditLog';\nimport mongoose from 'mongoose';"
);

content = content.replace(
  "export const createAuditLog = async (params: LogParams) => {",
  "export const createAuditLog = async (params: LogParams & { metadata?: any }, session?: mongoose.ClientSession) => {"
);

content = content.replace(
  "await AuditLog.create(params);",
  "if (session) {\n      await AuditLog.create([params], { session });\n    } else {\n      await AuditLog.create(params);\n    }"
);

fs.writeFileSync('server/src/utils/auditLog.ts', content);
