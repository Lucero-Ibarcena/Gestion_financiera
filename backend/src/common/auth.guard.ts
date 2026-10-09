import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly db: DatabaseService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const [scheme, token] = (request.headers.authorization || '').split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Iniciá sesión para continuar.');
    }

    try {
      const payload = await this.jwt.verifyAsync<{ sub: string }>(token);
      const user = this.db.data.users.find((item) => item.id === payload.sub);

      if (!user) {
        throw new Error('Usuario inexistente');
      }

      request.user = {
        id: user.id,
        name: user.name,
        email: user.email,
      };

      return true;
    } catch {
      throw new UnauthorizedException('La sesión venció. Volvé a ingresar.');
    }
  }
}
