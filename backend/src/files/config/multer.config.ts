import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { BadRequestException } from '@nestjs/common';

export const multerConfig: MulterOptions = {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, callback) => {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png', 
      'application/pdf'
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(
        new BadRequestException(
          `Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`
        ),
        false
      );
    }
  },
};