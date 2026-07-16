import multer from 'multer';
import { AppError } from './errorHandler';

// Limit file size to 10MB
const limits = {
  fileSize: 10 * 1024 * 1024, // 10MB
};

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip',
    'application/x-zip-compressed',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file type. Allowed: PDF, JPEG, PNG, Excel, ZIP', 400) as any, false);
  }
};

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits,
  fileFilter,
});
