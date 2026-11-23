import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  sub: string;
  email: string;
}

const cookieExtractor = (req: any) => {
  if (req && req.cookies && req.cookies.access_token) {
    return req.cookies.access_token;
  }
  if (req && req.headers && req.headers.cookie) {
    const rawCookie = req.headers.cookie as string;
    const match = rawCookie.match(/(?:^|;\s*)access_token=([^;]+)/);
    if (match) {
      return decodeURIComponent(match[1]);
    }
  }
  return null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        cookieExtractor,
      ]),
      ignoreExpiration: false,
      secretOrKey: config.get('jwt.secret'),
    });
  }

  async validate(payload: JwtPayload) {
    return { userId: payload.sub, email: payload.email };
  }
}
