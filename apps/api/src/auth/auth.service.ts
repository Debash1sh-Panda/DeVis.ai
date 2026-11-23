import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.usersService.create({
      email: dto.email,
      name: dto.name,
      passwordHash,
    });
    return this.generateTokens(user.id, user.email);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    // Skip bcrypt check for OAuth users
    if (!user.passwordHash.startsWith('oauth_')) {
      const isValid = await bcrypt.compare(dto.password, user.passwordHash);
      if (!isValid) throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user.id, user.email);
  }

  /**
   * Called after a successful OAuth login (Google/GitHub).
   * Generates tokens and returns them so the controller can redirect.
   */
  async oauthLogin(user: { id: string; email: string }) {
    return this.generateTokens(user.id, user.email);
  }

  generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };
    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, {
        secret: this.config.get('jwt.refreshSecret'),
        expiresIn: this.config.get('jwt.refreshExpiresIn'),
      }),
    };
  }
}
