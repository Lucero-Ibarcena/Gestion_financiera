import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { DatabaseService } from '../database/database.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DatabaseService,
    private readonly jwt: JwtService,
  ) {}

  async register(input: RegisterDto) {
    const email = input.email.trim().toLowerCase();
    const emailExists = this.db.data.users.some((user) => user.email === email);

    if (emailExists) {
      throw new ConflictException('Ya existe una cuenta con ese correo.');
    }

    const user = {
      id: randomUUID(),
      name: input.name.trim(),
      email,
      passwordHash: await bcrypt.hash(input.password, 12),
      createdAt: new Date().toISOString(),
    };

    this.db.data.users.push(user);
    await this.db.save();

    return this.session(user);
  }

  async login(input: LoginDto) {
    const email = input.email.trim().toLowerCase();
    const user = this.db.data.users.find((item) => item.email === email);

    if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
      throw new UnauthorizedException('El correo o la contraseña no coinciden.');
    }

    return this.session(user);
  }

  me(userId: string) {
    const user = this.db.data.users.find((item) => item.id === userId);

    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }

  private async session(user: { id: string; name: string; email: string }) {
    const accessToken = await this.jwt.signAsync({ sub: user.id });

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }
}
