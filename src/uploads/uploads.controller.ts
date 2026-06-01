// uploads/uploads.controller.ts
import {
  Controller,
  Post,
  Get,
  Param,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import * as path from 'path';
import * as fs from 'fs';
import type { Response } from 'express';

const UPLOADS_DIR = path.join(process.cwd(), 'images');

@Controller('api/uploads')
export class UploadsController {
  /**
   * Handle single file upload.
   * Use FileInterceptor with field name 'file' (must match client-side form-data).
   * The @UploadedFile() decorator extracts the file from the request.
   */
  // POST /api/uploads
  @Post()
  @UseInterceptors(FileInterceptor('file')) // 'file' is the field name
  public uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    // Return success response with file information
    return {
      message: 'File uploaded successfully',
      filename: file.filename,
      originalName: file.originalname,
      url: `/api/uploads/${file.filename}`,
      // Convert bytes to KB so the response is easy to read while testing.
      size: `${(file.size / 1024).toFixed(2)} KB`,
    };
  }

  /**
   * Handle multiple file upload.
   * Use FilesInterceptor with field name 'files' (must match client-side form-data).
   * The @UploadedFiles() decorator extracts the uploaded files array.
   */
  // POST /api/uploads/multiple
  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files')) // 'files' is the field name
  public uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    return {
      message: 'Files uploaded successfully',
      files: files.map((file) => ({
        filename: file.filename,
        originalName: file.originalname,
        url: `/api/uploads/${file.filename}`,
        size: `${(file.size / 1024).toFixed(2)} KB`,
      })),
      size: `${(files.reduce((sum, file) => sum + file.size, 0) / 1024).toFixed(2)} KB`,
    };
  }

  /**
   * Serve uploaded files statically.
   * This endpoint allows clients to view/download uploaded images.
   */
  // GET /api/uploads/:image (example: /api/uploads/1234567890-image.jpg)
  @Get(':image')
  getFile(@Param('image') image: string, @Res() res: Response) {
    // Build the path on the server and keep only the filename.
    // This blocks path traversal attempts like ../../.env.
    const safeFilename = path.basename(image);
    const filePath = path.join(UPLOADS_DIR, safeFilename);

    // Check if the file exists before sending a clearer API error.
    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }

    throw new BadRequestException('File not found');
  }
}
