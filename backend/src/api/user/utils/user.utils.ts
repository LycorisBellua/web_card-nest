import { randomBytes } from 'crypto';

export function getVerificationToken() {
  return randomBytes(32).toString('hex');
}

export function getVerificationTimeout() {
  return new Date(Date.now() + 24 * 60 * 60 * 1000);
}

export function getCurrentTime() {
  return new Date();
}
