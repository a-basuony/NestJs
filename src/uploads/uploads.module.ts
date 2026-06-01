// uploads/uploads.module.ts
import { BadRequestException, Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { UploadsController } from './uploads.controller';

@Module({
  imports: [
    // Configure Multer once for this module so every upload route uses
    // the same folder, filename style, file type check, and size limit.
    MulterModule.register({
      storage: diskStorage({
        // Store uploaded files outside src/dist so builds do not erase them.
        destination: 'images',
        filename: (req, file, cb) => {
          // Prefix the original filename to avoid overwriting files with the same name.
          const prefix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const filename = `${prefix}-${file.originalname}`;
          cb(null, filename);
        },
      }),
      fileFilter: (req, file, cb) => {
        // This checks Multer's mimetype metadata before saving.
        // For production, also validate the real file bytes with a package like file-type.
        if (file.mimetype.startsWith('image')) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only image files are allowed'), false);
        }
      },
      limits: {
        fileSize: 1024 * 1024 * 5,
      },
    }),
  ],
  controllers: [UploadsController],
})
export class UploadsModule {}
