import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import { Ranks } from 'src/generated/prisma/enums';

export function getToken(): string {
  return randomBytes(32).toString('hex');
}

export function getVerificationTimeout(): Date {
  return new Date(Date.now() + 24 * 60 * 60 * 1000);
}

export function getRefreshTimeout(): Date {
  return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
}

export function getCurrentTime(): Date {
  return new Date();
}

export async function createHash(plain: string) {
  return await bcrypt.hash(plain, 12);
}

export async function compareHash(plain: string, hashed: string) {
export async function createHash(plain: string): Promise<string> {
  return await bcrypt.hash(plain, 12);
}

export async function compareHash(
  plain: string,
  hashed: string,
): Promise<boolean> {
  return await bcrypt.compare(plain, hashed);
}

export function encodeSingleAvatar(found: {
  id: string;
  username: string;
  rank: Ranks;
  avatar: Uint8Array<ArrayBuffer> | null;
  email?: string | null;
  email_unverified?: string | null;
}) {
  return {
    ...found,
    avatar: found.avatar ? Buffer.from(found.avatar).toString('base64') : null,
  };
}

export function encodeMultipleAvatars(
  users: {
    id: string;
    username: string;
    rank: Ranks;
    avatar: Uint8Array<ArrayBuffer> | null;
  }[],
) {
  return users.map(encodeSingleAvatar);
}

// PASSWORD VALIDATION
// These are needed as the decorators used when creating a user compare
// against the username/email in the dto. When just updating a password,
// these decorators are invalid. Same logic as createUserDto decorators.
export function newPasswordContainsEmail(
  password: string,
  email: string | null,
): boolean {
  if (!email || !password) return false;

  const atIndex = email.indexOf('@');
  if (atIndex === -1) return false;

  const localPart = email.substring(0, atIndex);
  const domainPart = email.substring(atIndex + 1);
  const passwordLower = password.toLowerCase();

  return (
    (localPart.length > 0 && passwordLower.includes(localPart.toLowerCase())) ||
    (domainPart.length > 0 && passwordLower.includes(domainPart.toLowerCase()))
  );
}

export function newPasswordContainsUsername(
  password: string,
  username: string,
): boolean {
  if (!username || !password) return false;
  return password.toLowerCase().includes(username.toLowerCase());
}
