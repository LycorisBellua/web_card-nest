export function sanitizeUsername(uname: string): string {
  if (!uname) return '';
  return uname
    .normalize('NFC')
    .trim()
    .replace(/[\x00-\x1F\x7F]/g, '')
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
