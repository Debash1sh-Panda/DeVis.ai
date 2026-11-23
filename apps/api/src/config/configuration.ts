export default () => ({
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  database: {
    url: process.env.DATABASE_URL,
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  ai: {
    provider: process.env.AI_PROVIDER || 'gemini',
    geminiApiKey: process.env.GEMINI_API_KEY,
    openaiApiKey: process.env.OPENAI_API_KEY,
  },

  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    chatId: process.env.TELEGRAM_CHAT_ID,
  },

  playwright: {
    headless: process.env.PLAYWRIGHT_HEADLESS !== 'false',
    browser: process.env.PLAYWRIGHT_BROWSER || 'chromium',
  },

  rateLimit: {
    ttl: parseInt(process.env.RATE_LIMIT_TTL || '60', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  },

  oauth: {
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    githubClientId: process.env.GITHUB_CLIENT_ID,
    githubClientSecret: process.env.GITHUB_CLIENT_SECRET,
  },

  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  backendUrl: process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3001}`,
});
