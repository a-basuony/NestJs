// uploads/uploads.module.ts
import { BadRequestException, Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { UploadsController } from './uploads.controller';

@Module({
  imports: [
    // Configure MulterModule with custom storage settings
    MulterModule.register({
      storage: diskStorage({
        destination: 'images',
        filename: (req, file, cb) => {
          const prefix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const filename = `${prefix}-${file.originalname}`;
          cb(null, filename);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image')) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only image files are allowed'), false);
        }
      },
      limits: {
        fileSize: 1024 * 1024 * 5, // 5MB
      },
    }),
  ],
  controllers: [UploadsController],
})
export class UploadsModule {}
