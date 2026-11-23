import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3001),

  // Database — required to connect
  DATABASE_URL: Joi.string().required(),

  // Redis — all optional with defaults
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().optional().allow(''),

  // JWT — required for auth
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),

  // AI providers — optional (empty string allowed)
  AI_PROVIDER: Joi.string().valid('gemini', 'openai').default('gemini'),
  GEMINI_API_KEY: Joi.string().optional().allow(''),
  OPENAI_API_KEY: Joi.string().optional().allow(''),

  // OAuth — optional (empty string allowed)
  GOOGLE_CLIENT_ID: Joi.string().optional().allow(''),
  GOOGLE_CLIENT_SECRET: Joi.string().optional().allow(''),
  GITHUB_CLIENT_ID: Joi.string().optional().allow(''),
  GITHUB_CLIENT_SECRET: Joi.string().optional().allow(''),

  // Telegram — optional
  TELEGRAM_BOT_TOKEN: Joi.string().optional().allow(''),
  TELEGRAM_CHAT_ID: Joi.string().optional().allow(''),

  // Gmail integration — optional
  GMAIL_CLIENT_ID: Joi.string().optional().allow(''),
  GMAIL_CLIENT_SECRET: Joi.string().optional().allow(''),

  // Playwright — optional with defaults
  PLAYWRIGHT_HEADLESS: Joi.boolean().default(true),
  PLAYWRIGHT_BROWSER: Joi.string().default('chromium'),

  // Rate limiting
  RATE_LIMIT_TTL: Joi.number().default(60),
  RATE_LIMIT_MAX: Joi.number().default(100),

  // Frontend URL for CORS & OAuth redirects
  FRONTEND_URL: Joi.string().default('http://localhost:3000'),

  // BullMQ admin (optional)
  BULL_BOARD_USER: Joi.string().optional().allow(''),
  BULL_BOARD_PASSWORD: Joi.string().optional().allow(''),

  // Next.js public vars (may appear in env, just allow them)
  NEXT_PUBLIC_API_URL: Joi.string().optional().allow(''),
  NEXT_PUBLIC_WS_URL: Joi.string().optional().allow(''),
}).unknown(true); // allow any extra keys without failing
