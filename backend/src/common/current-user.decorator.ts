import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AccountUser } from '../database/database.types';

export const CurrentUser = createParamDecorator(
  (
    _data: unknown,
    ctx: ExecutionContext,
  ): Pick<AccountUser, 'id' | 'name' | 'email'> => {
    return ctx.switchToHttp().getRequest().user;
  },
);
