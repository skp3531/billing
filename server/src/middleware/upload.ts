// @ts-ignore
import multer from 'multer';
import path from 'path';
import { Request } from 'express';

const storage = multer.memoryStorage();

// @ts-ignore
const fileFilter = (req: Request, file: any, cb: any) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === '.csv') {
    cb(null, true);
  } else {
    cb(new Error('Only CSV files are allowed'));
  }
};

export const uploadCSV = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});
