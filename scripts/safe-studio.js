#!/usr/bin/env node

/**
 * DeVis.ai — Secure Prisma Studio Launcher
 *
 * Security Enforcement:
 * 1. Blocks execution if NODE_ENV=production.
 * 2. Strictly locks binding to 127.0.0.1 (local loopback only)
 *    preventing any external or network IP from accessing your database.
 * 3. Gracefully terminates child process on Ctrl + C.
 */

const { spawn } = require('child_process');
const path = require('path');

// 1. Strict Production Guard
if (process.env.NODE_ENV === 'production') {
  console.error('\n🚨 [SECURITY ALERT] Prisma Studio cannot be executed in production!');
  console.error('Prisma Studio provides unauthenticated raw access to your database.');
  console.error('Run Prisma Studio ONLY on your local development machine (127.0.0.1).\n');
  process.exit(1);
}

// 2. Locate Prisma schema
const schemaPath = path.resolve(__dirname, '../packages/database/prisma/schema.prisma');

console.log('\n🔒 [SECURITY GUARD ACTIVE]');
console.log('• Bound strictly to: http://127.0.0.1:5555 (Local Loopback Only)');
console.log('• External network & public access: BLOCKED');
console.log('• Remember: Press Ctrl + C in this terminal when finished to close Studio.\n');

// 3. Launch Prisma Studio bound strictly to 127.0.0.1
const command = `npx prisma studio --schema="${schemaPath}" --hostname=127.0.0.1 --port=5555`;

const child = spawn(command, {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'development',
  },
  shell: true,
});

child.on('error', (err) => {
  console.error('Failed to start Prisma Studio:', err);
  process.exit(1);
});

child.on('close', (code) => {
  console.log('\n🔒 Prisma Studio safely stopped.');
  process.exit(code || 0);
});

// Clean termination handling
process.on('SIGINT', () => {
  child.kill('SIGINT');
});
process.on('SIGTERM', () => {
  child.kill('SIGTERM');
});
