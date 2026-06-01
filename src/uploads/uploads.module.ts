// uploads/uploads.module.ts
import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { UploadsController } from './uploads.controller';

@Module({
  imports: [
    // Configure MulterModule with custom storage settings
    MulterModule.register(),
  ],
  controllers: [UploadsController],
})
export class UploadsModule {}
