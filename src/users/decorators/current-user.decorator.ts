import {
  createParamDecorator,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';
import { CURRENT_USER_KEY } from 'src/utils/constants';
import { JWTPayloadType } from 'src/utils/types';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): JWTPayloadType => {
    const request = context.switchToHttp().getRequest();
    const payload: JWTPayloadType = request[CURRENT_USER_KEY];
    if (!payload) {
      // throw new Error('User not found in request');
      throw new NotFoundException('User not found in request');
    }
    return payload;
  },
);
