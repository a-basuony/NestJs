// uploads/uploads.controller.ts
import {
  Controller,
  Post,
  Get,
  Param,
  UseInterceptors,
  UploadedFile,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as path from 'path';
import * as fs from 'fs';
import { diskStorage } from 'multer';
import type { Response } from 'express';

@Controller('api/uploads')
export class UploadsController {
  /**
   * Handle single file upload.
   * Use FileInterceptor with field name 'image' (must match client-side field name).
   * The @UploadedFile() decorator extracts the file from the request.
   */
  // POST : ~/api/uploads
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
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
  ) // 'file' is the field name
  public uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    // Return success response with file information
    return {
      message: 'File uploaded successfully',
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      //how  turn file size into human-readable format
      size: `${(file.size / 1024).toFixed(2)} KB`,
    };
  }

  /**
   * Serve uploaded files statically.
   * This endpoint allows clients to view/download uploaded images.
   */
  @Get(':image')
  getFile(@Param('image') image: string, @Res() res: Response) {
    const filePath = path.join(process.cwd(), 'images', image);
    // Check if file exists before sending
    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    } else {
      throw new BadRequestException('File not found');
    }
  }
}
