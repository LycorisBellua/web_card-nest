export function sanitizeUsername(uname: string): string {
  if (!uname) return '';
  return uname
    .normalize('NFC')
    .trim()
    .replace(/\p{Cc}/gu, '')
    .replace(/\s+/g, ' ');
}

export function sanitizeEmail(uemail: string): string {
  if (!uemail) return '';
  return uemail.normalize('NFC').trim();
}

export function sanitizePassword(upassword: string): string {
  if (!upassword) return '';
  return upassword.normalize('NFC');
}

export function sanitizeDescription(udesc: string): string {
  if (!udesc) return '';
  return udesc.normalize('NFC');
}

export function sanitizeMessage(msg: string, maxLen: number): string {
  if (!msg || maxLen <= 0) return '';
  return msg.normalize('NFC').trim().substring(0, maxLen);
}

// No sanitation for the avatar
