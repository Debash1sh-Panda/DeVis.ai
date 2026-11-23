import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private config: ConfigService,
    private usersService: UsersService,
  ) {
    const clientID =
      config.get<string>('oauth.googleClientId')?.trim() ||
      process.env.GOOGLE_CLIENT_ID?.trim() ||
      'GOOGLE_CLIENT_ID';

    const clientSecret =
      config.get<string>('oauth.googleClientSecret')?.trim() ||
      process.env.GOOGLE_CLIENT_SECRET?.trim() ||
      'GOOGLE_CLIENT_SECRET';

    super({
      clientID,
      clientSecret,
      callbackURL: `${config.get('backendUrl') || 'http://localhost:3001'}/api/v1/auth/google/callback`,
      scope: ['email', 'profile'],
    });

    const logger = new Logger(GoogleStrategy.name);
    if (clientID === 'GOOGLE_CLIENT_ID') {
      logger.warn('Google OAuth is using placeholder GOOGLE_CLIENT_ID. Please set GOOGLE_CLIENT_ID in .env');
    } else {
      logger.log(`Google OAuth initialized with Client ID: ${clientID.slice(0, 15)}...`);
    }
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    const { emails, displayName, id } = profile;
    const email = emails?.[0]?.value || `google_${id}@devis.ai`;

    let user = await this.usersService.findByEmail(email);
    if (!user) {
      user = await this.usersService.create({
        email,
        name: displayName || 'Google User',
        passwordHash: `oauth_google_${id}`,
      });
    }

    done(null, user);
  }
}
