import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github2';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private config: ConfigService,
    private usersService: UsersService,
  ) {
    const clientID =
      config.get<string>('oauth.githubClientId')?.trim() ||
      process.env.GITHUB_CLIENT_ID?.trim() ||
      'GITHUB_CLIENT_ID';

    const clientSecret =
      config.get<string>('oauth.githubClientSecret')?.trim() ||
      process.env.GITHUB_CLIENT_SECRET?.trim() ||
      'GITHUB_CLIENT_SECRET';

    super({
      clientID,
      clientSecret,
      callbackURL: `${config.get('backendUrl') || 'http://localhost:3001'}/api/v1/auth/github/callback`,
      scope: ['user:email'],
    });

    const logger = new Logger(GithubStrategy.name);
    if (clientID === 'GITHUB_CLIENT_ID') {
      logger.warn('GitHub OAuth is using placeholder GITHUB_CLIENT_ID. Please set GITHUB_CLIENT_ID in .env');
    } else {
      logger.log(`GitHub OAuth initialized with Client ID: ${clientID.slice(0, 10)}...`);
    }
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: Function,
  ) {
    const { emails, displayName, id, username } = profile;
    const email = emails?.[0]?.value || `github_${id}@devis.ai`;

    let user = await this.usersService.findByEmail(email);
    if (!user) {
      user = await this.usersService.create({
        email,
        name: displayName || username || 'GitHub User',
        passwordHash: `oauth_github_${id}`,
      });
    }

    done(null, user);
  }
}
