import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Ranks } from 'src/generated/prisma/enums';
import { JwtPayload } from '../jwt/auth.jwt-payload';

const rankLevel: Record<Ranks, number> = {
  [Ranks.USER]: 0,
  [Ranks.MODERATOR]: 1,
  [Ranks.ADMIN]: 2,
};

@Injectable()
export class RankGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRank = this.reflector.get<Ranks>(
      'rank',
      context.getHandler(),
    );
    if (!requiredRank) {
      return true;
    }
    const request: Request = context.switchToHttp().getRequest();
    const user = request['user'] as JwtPayload;
    if (rankLevel[user.rank] < rankLevel[requiredRank]) {
      throw new ForbiddenException();
    }
    return true;
  }
}
