import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { JWTAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import type { JWTPayloadType } from 'src/utils/types';
import { Roles } from './decorators/roles.decorator';
import { UserType } from 'src/utils/enums';
import { RolesGuard } from './guards/roles.guard';
import { UpdateUserDto } from './dtos/update-user.dto';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
// import { LoggingInterceptor } from './interceptors/logging.interceptor';

@Controller('/api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Register new user
   * POST /api/users/auth/register
   */
  @Post('auth/register')
  public register(@Body() body: RegisterDto) {
    return this.usersService.register(body);
  }

  /**
   *Login user
   * @param body data for login user account
   * @returns JWT (access token)
   */
  @Post('auth/login')
  @HttpCode(HttpStatus.OK) // Set the response status code to 200 OK for successful login
  public login(@Body() body: LoginDto) {
    return this.usersService.login(body);
  }

  /**
   *  Get current user details
   * GET /api/users/current-user
   * @param payload  JWT payload extracted from the token, containing user information
   * @returns  User object
   */
  @Get('current-user')
  @UseGuards(JWTAuthGuard) // Protect this route with JWT authentication
  // @UseInterceptors(LoggingInterceptor) // Apply the logging interceptor to this route
  @UseInterceptors(ClassSerializerInterceptor) // Apply the ClassSerializerInterceptor to this route
  getCurrentUser(@CurrentUser() payload: JWTPayloadType) {
    return this.usersService.getCurrentUser(payload.id);
  }

  @Get('all')
  @Roles(UserType.ADMIN) // Only allow access to users with the ADMIN role
  @UseGuards(JWTAuthGuard, RolesGuard) // Protect this route with JWT authentication and role-based access control
  getAllUsers() {
    return this.usersService.getAllUsers();
  }

  @Patch('update')
  @Roles(UserType.ADMIN, UserType.USER) // Allow access to both ADMIN and USER roles
  @UseGuards(JWTAuthGuard, RolesGuard) // Protect this route with JWT authentication and role-based access control
  updateUser(
    @CurrentUser() payload: JWTPayloadType,
    @Body() body: UpdateUserDto,
  ) {
    return this.usersService.updateUser(payload.id, body);
  }
  /**
   *  Delete a user by ID. Only the user themselves or an admin can delete the account.
   * @param userId - ID of the user to be deleted
   * @param payload  - JWT payload containing the ID and user type of the requester
   * @returns  A message indicating successful deletion or an error if the user is not found or the requester is not authorized
   */
  @Delete(':id')
  @Roles(UserType.ADMIN, UserType.USER) // Allow access to both ADMIN and USER roles
  @UseGuards(JWTAuthGuard, RolesGuard) // Protect this route with JW`T authentication and role-based access control
  deleteUser(
    @CurrentUser() payload: JWTPayloadType,
    @Param('id', ParseIntPipe) userId: number,
  ) {
    return this.usersService.deleteUser(userId, payload);
  }

  /**
   * Upload user profile image
   * Only authenticated users can upload their own profile image. Admins can upload for any user.
   * The uploaded image will be saved to the server's filesystem, and the file path will be stored in the user's profile in the database.
   * @param file - The uploaded image file (handled by Multer)
   * @param payload - JWT payload containing the ID and user type of the requester
   * @return A message indicating successful upload and the filename of the uploaded image, or an error if the upload fails or the requester is not authorized
   */
  // POST /api/users/upload-image
  @Post('upload-image')
  @UseGuards(JWTAuthGuard) // Protect this route with JWT authentication and role-based access control
  @UseInterceptors(
    FileInterceptor('user-image', {
      // field name in the form-data
      storage: diskStorage({
        // Files are saved outside src/dist so rebuilds do not delete uploads.
        destination: 'images/users',
        filename: (req, file, cb) => {
          // Add a unique prefix so users can upload files with the same original name.
          const prefix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const filename = `${prefix}-${file.originalname}`;
          cb(null, filename);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Multer checks the uploaded file metadata before saving it.
        // For production apps, also inspect file contents with a library like file-type.
        if (file.mimetype.startsWith('image')) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only image files are allowed!'), false);
        }
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadProfileImage(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() payload: JWTPayloadType,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // The service handles replacing the old image and updating the database.
    // Keeping this logic in one place avoids deleting the same file twice.
    const updatedUser = await this.usersService.setProfileImage(
      payload.id,
      file.filename,
    );
    return {
      message: 'Profile image updated successfully',
      filename: file.filename,
      user: updatedUser,
    };
  }

  /**
   * Delete profile image of the user. This will remove the image path from the database and delete the image file from the server.
   * @param payload - JWT payload containing the ID and user type of the requester
   * @returns A message indicating successful deletion or an error if the user is not found or the requester is not authorized
   */
  // DELETE /api/users/images/remove-profile-image
  @Delete('images/remove-profile-image')
  @UseGuards(JWTAuthGuard)
  async removeProfileImage(@CurrentUser() payload: JWTPayloadType) {
    const updatedUser = await this.usersService.removeProfileImage(payload.id);
    return { message: 'Profile image deleted successfully', user: updatedUser };
  }

  /**
   * Get the profile image of the user. This will return the URL of the profile image if it exists, or a default image URL if the user does not have a profile image.
   * Protected: only authenticated users can access their own profile image or an admin can access any user's profile image.
   */
  @Get('profile-image/:filename')
  @UseGuards(JWTAuthGuard)
  async getProfileImage(
    @Param('filename') filename: string,
    @CurrentUser() payload: JWTPayloadType,
    @Res() res: Response,
  ) {
    // sendFile needs an absolute path. The service also checks that this
    // filename belongs to the authenticated user's saved profile image.
    const filePath = await this.usersService.getProfileImagePath(
      payload.id,
      filename,
    );
    return res.sendFile(filePath);
  }
}
