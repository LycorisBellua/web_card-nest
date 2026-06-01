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

<<<<<<< HEAD
=======
export function sanitizeMessage(msg: string): string {
  if (!msg) return '';
  return msg.normalize('NFC').trim();
}

>>>>>>> parent of 6076e3e ([Frontend] Connect to backend (#94))
// No sanitation for the avatar
