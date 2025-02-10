import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    if (data) {
      return request.user?.[data];
    }

    try {
      return request.user;
    } catch (error) {
      return 'user not found';
    }
  },
);
