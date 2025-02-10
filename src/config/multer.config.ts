import { HttpException, HttpStatus } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';

export const multerConfig = {
  storage: diskStorage({
    destination: './uploads',
    filename: (req, file, callback) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const newFileName = `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`;
      callback(null, newFileName);
    },
  }),
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter: (req, file, callback) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
      return callback(
        new HttpException(
          {
            statusCode: '01',
            status: 'failed',
            message: 'Only image files (jpg, jpeg, png, gif) are allowed',
          },
          HttpStatus.BAD_REQUEST,
        ),
        false,
      );
    }
    callback(null, true);
  },
};
