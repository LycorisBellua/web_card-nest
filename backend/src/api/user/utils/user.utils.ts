import { randomBytes } from 'crypto';

export function getVerificationToken(): string {
  return randomBytes(32).toString('hex');
}

export function getVerificationTimeout(): Date {
  return new Date(Date.now() + 24 * 60 * 60 * 1000);
}

export function getCurrentTime(): Date {
  return new Date();
}
