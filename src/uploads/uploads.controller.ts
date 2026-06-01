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
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
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
      path: file.path,
      //how  turn file size into human-readable format
      size: `${(file.size / 1024).toFixed(2)} KB`,
    };
  }
  /**
   * Handle multiple file upload.
   * Use FilesInterceptor with field name 'image' (must match client-side field name).
   * The @UploadedFile() decorator extracts the file from the request.
   */
  // POST : ~/api/uploads
  @Post()
  @UseInterceptors(FilesInterceptor('file')) // 'file' is the field name
  public uploadFiles(@UploadedFile() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }
    // Return success response with file information
    return {
      message: 'Files uploaded successfully',
      filenames: files.map((file) => file.filename),
      originalNames: files.map((file) => file.originalname),
      path: files[0].path,
      //how  turn file size into human-readable format
      size: `${(files.reduce((sum, file) => sum + file.size, 0) / 1024).toFixed(2)} KB`,
    };
  }

  /**
   * Serve uploaded files statically.
   * This endpoint allows clients to view/download uploaded images.
   */
  // GET : ~/api/uploads/:image (e.g., ~/api/uploads/1234567890-image.jpg)

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
