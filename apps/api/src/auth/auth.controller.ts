import {
  Controller, Post, Body, HttpCode, HttpStatus,
  Get, UseGuards, Request, Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { GoogleAuthGuard, GithubAuthGuard } from './guards/oauth.guard';

@ApiTags('Auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // ── Google OAuth ──────────────────────────────────────────────────────
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Redirect to Google OAuth consent screen' })
  googleAuth() {
    // Passport handles the redirect automatically
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google OAuth callback' })
  async googleCallback(@Request() req: any, @Res() res: Response) {
    const tokens = await this.authService.oauthLogin(req.user);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    // Redirect to frontend with tokens in query params (frontend stores them)
    res.redirect(
      `${frontendUrl}/auth/callback?access_token=${tokens.accessToken}&refresh_token=${tokens.refreshToken}`,
    );
  }

  // ── GitHub OAuth ──────────────────────────────────────────────────────
  @Get('github')
  @UseGuards(GithubAuthGuard)
  @ApiOperation({ summary: 'Redirect to GitHub OAuth consent screen' })
  githubAuth() {
    // Passport handles the redirect automatically
  }

  @Get('github/callback')
  @UseGuards(GithubAuthGuard)
  @ApiOperation({ summary: 'GitHub OAuth callback' })
  async githubCallback(@Request() req: any, @Res() res: Response) {
    const tokens = await this.authService.oauthLogin(req.user);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(
      `${frontendUrl}/auth/callback?access_token=${tokens.accessToken}&refresh_token=${tokens.refreshToken}`,
    );
  }
}
