export function validateUsername(uname: string): string[] {
  const errors: string[] = [];
  if (!uname) {
    errors.push('The username cannot be empty.');
  }
  if (uname.length > 20) {
    errors.push('The username cannot be longer than 20 characters.');
  }
  return errors;
}

export function validateEmail(uemail: string): string[] {
  const errors: string[] = [];
  if (!uemail) {
    errors.push('The email address cannot be empty.');
  }
  const noEmoji = !/\p{Extended_Pictographic}/u.test(uemail);
  if (!uemail.includes('@') || /\p{Cc}/gu.test(uemail) || !noEmoji) {
    errors.push('The email address is not valid.');
    return errors;
  }
  const parts = uemail.split('@');
  if (parts.length < 2) {
    errors.push('The email address is not valid.');
    return errors;
  }
  const [local, domain] = parts;
  const illegalChar = /[\s&='",<>\\{}[\]!#$%*+/?^|~]/;
  if (
    local.startsWith('.') ||
    local.endsWith('.') ||
    local.includes('..') ||
    illegalChar.test(local) ||
    /[@&='",<>\\!#$%*+/?^|~]/.test(domain) ||
    !/^[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(domain)
  ) {
    errors.push('The email address is not valid.');
    return errors;
  }
  return errors;
}

export function validatePassword(
  upassword: string,
  uname: string,
  uemail: string,
): string[] {
  const errors: string[] = [];
  if (!upassword || upassword.length < 8)
    errors.push('The password must have at least 8 characters.');
  if (!/[A-Z]/.test(upassword))
    errors.push('The password must have at least 1 uppercase letter.');
  if (!/[a-z]/.test(upassword))
    errors.push('The password must have at least 1 lowercase letter.');
  if (!/\d/.test(upassword))
    errors.push('The password must have at least 1 digit.');
  if (!/[!@#$%^&*()_+\-=[\]{};':"|,.<>/?]/.test(upassword))
    errors.push('The password must have at least 1 symbol.');
  if (uname.length && upassword.includes(uname))
    errors.push('The password cannot contain the username.');
  const idx: number = uemail.search('@');
  if (idx != -1) {
    const mailExt: string = uemail.substring(idx + 1);
    if (upassword.search(mailExt) != -1) {
      errors.push('The password cannot contain the email address.');
    }
  }
  if (/\p{Cc}/gu.test(upassword)) {
    errors.push('The password cannot have non-printable characters.');
  }
  if (upassword.length > 128) {
    errors.push('The password cannot be longer than 128 characters.');
  }
  return errors;
}
