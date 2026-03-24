import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidateBy,
  buildMessage,
} from 'class-validator';

/* USERNAME VALIDATORS ------------------------------------------------------ */

export function IsUsernameNotEmpty(validationOptions?: ValidationOptions) {
  return ValidateBy(
    {
      name: 'isUsernameNotEmpty',
      validator: {
        validate(value: string): boolean {
          return !!value;
        },
        defaultMessage: buildMessage(
          (eachPrefix) => eachPrefix + 'The username cannot be empty.',
          validationOptions,
        ),
      },
    },
    validationOptions,
  );
}

export function IsUsernameNotTooLong(validationOptions?: ValidationOptions) {
  return ValidateBy(
    {
      name: 'isUsernameNotTooLong',
      validator: {
        validate(value: string): boolean {
          return !value || value.length <= 20;
        },
        defaultMessage: buildMessage(
          (eachPrefix) =>
            eachPrefix + 'The username cannot be longer than 20 characters.',
          validationOptions,
        ),
      },
    },
    validationOptions,
  );
}

/* EMAIL VALIDATORS --------------------------------------------------------- */

export function IsEmailNotEmpty(validationOptions?: ValidationOptions) {
  return ValidateBy(
    {
      name: 'isEmailNotEmpty',
      validator: {
        validate(value: string): boolean {
          return !!value;
        },
        defaultMessage: buildMessage(
          (eachPrefix) => eachPrefix + 'The email address cannot be empty.',
          validationOptions,
        ),
      },
    },
    validationOptions,
  );
}

export function IsEmailFormatValid(validationOptions?: ValidationOptions) {
  return ValidateBy(
    {
      name: 'isEmailFormatValid',
      validator: {
        validate(value: string): boolean {
          if (!value) return true;

          const noEmoji = !/\p{Extended_Pictographic}/u.test(value);
          if (!value.includes('@') || /\p{Cc}/gu.test(value) || !noEmoji) {
            return false;
          }

          const parts = value.split('@');
          if (parts.length < 2) return false;

          const [local, domain] = parts;
          const illegalLocalChar = /[\s&='",<>\\{}[\]!#$%*+/?^|~]/;

          if (
            local.startsWith('.') ||
            local.endsWith('.') ||
            local.includes('..') ||
            illegalLocalChar.test(local) ||
            /[@&='",<>\\!#$%*+/?^|~]/.test(domain) ||
            !/^[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(domain)
          ) {
            return false;
          }

          return true;
        },
        defaultMessage: buildMessage(
          (eachPrefix) => eachPrefix + 'The email address is not valid.',
          validationOptions,
        ),
      },
    },
    validationOptions,
  );
}

/* PASSWORD VALIDATORS ------------------------------------------------------ */

export function IsPasswordLongEnough(validationOptions?: ValidationOptions) {
  return ValidateBy(
    {
      name: 'isPasswordLongEnough',
      validator: {
        validate(value: string): boolean {
          return !!value && value.length >= 8;
        },
        defaultMessage: buildMessage(
          (eachPrefix) =>
            eachPrefix + 'The password must have at least 8 characters.',
          validationOptions,
        ),
      },
    },
    validationOptions,
  );
}

export function PasswordHasUppercase(validationOptions?: ValidationOptions) {
  return ValidateBy(
    {
      name: 'passwordHasUppercase',
      validator: {
        validate(value: string): boolean {
          return /[A-Z]/.test(value);
        },
        defaultMessage: buildMessage(
          (eachPrefix) =>
            eachPrefix + 'The password must have at least 1 uppercase letter.',
          validationOptions,
        ),
      },
    },
    validationOptions,
  );
}

export function PasswordHasLowercase(validationOptions?: ValidationOptions) {
  return ValidateBy(
    {
      name: 'passwordHasLowercase',
      validator: {
        validate(value: string): boolean {
          return /[a-z]/.test(value);
        },
        defaultMessage: buildMessage(
          (eachPrefix) =>
            eachPrefix + 'The password must have at least 1 lowercase letter.',
          validationOptions,
        ),
      },
    },
    validationOptions,
  );
}

export function PasswordHasDigit(validationOptions?: ValidationOptions) {
  return ValidateBy(
    {
      name: 'passwordHasDigit',
      validator: {
        validate(value: string): boolean {
          return /\d/.test(value);
        },
        defaultMessage: buildMessage(
          (eachPrefix) =>
            eachPrefix + 'The password must have at least 1 digit.',
          validationOptions,
        ),
      },
    },
    validationOptions,
  );
}

export function PasswordHasSymbol(validationOptions?: ValidationOptions) {
  return ValidateBy(
    {
      name: 'passwordHasSymbol',
      validator: {
        validate(value: string): boolean {
          return /[!@#$%^&*()_+\-=[\]{};':"|,.<>/?]/.test(value);
        },
        defaultMessage: buildMessage(
          (eachPrefix) =>
            eachPrefix + 'The password must have at least 1 symbol.',
          validationOptions,
        ),
      },
    },
    validationOptions,
  );
}

export function PasswordNotContainsUsername(
  usernameField: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'passwordNotContainsUsername',
      target: (object as any).constructor,
      propertyName,
      constraints: [usernameField],
      options: {
        message: 'The password cannot contain the username.',
        ...validationOptions,
      },
      validator: {
        validate(value: string, args: ValidationArguments): boolean {
          const username = (args.object as any)[args.constraints[0]] as string;
          if (!username || !value) return true;
          return !value.toLowerCase().includes(username.toLowerCase());
        },
      },
    });
  };
}

export function PasswordNotContainsEmail(
  emailField: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'passwordNotContainsEmail',
      target: (object as any).constructor,
      propertyName,
      constraints: [emailField],
      options: {
        message: 'The password cannot contain the email address.',
        ...validationOptions,
      },
      validator: {
        validate(value: string, args: ValidationArguments): boolean {
          const email = (args.object as any)[args.constraints[0]] as string;
          if (!email || !value) return true;

          const atIndex = email.indexOf('@');
          if (atIndex === -1) return true;

          const localPart = email.substring(0, atIndex);
          const domainPart = email.substring(atIndex + 1);
          const passwordLower = value.toLowerCase();

          return !(
            (localPart && passwordLower.includes(localPart.toLowerCase())) ||
            (domainPart && passwordLower.includes(domainPart.toLowerCase()))
          );
        },
      },
    });
  };
}

export function PasswordHasNoControlChars(
  validationOptions?: ValidationOptions,
) {
  return ValidateBy(
    {
      name: 'passwordHasNoControlChars',
      validator: {
        validate(value: string): boolean {
          return !value || !/\p{Cc}/gu.test(value);
        },
        defaultMessage: buildMessage(
          (eachPrefix) =>
            eachPrefix + 'The password cannot have non-printable characters.',
          validationOptions,
        ),
      },
    },
    validationOptions,
  );
}

export function IsPasswordNotTooLong(validationOptions?: ValidationOptions) {
  return ValidateBy(
    {
      name: 'isPasswordNotTooLong',
      validator: {
        validate(value: string): boolean {
          return !value || value.length <= 128;
        },
        defaultMessage: buildMessage(
          (eachPrefix) =>
            eachPrefix + 'The password cannot be longer than 128 characters.',
          validationOptions,
        ),
      },
    },
    validationOptions,
  );
}

/* DESCRIPTION VALIDATORS --------------------------------------------------- */

export function IsDescriptionNotTooLong(validationOptions?: ValidationOptions) {
  return ValidateBy(
    {
      name: 'isDescriptionNotTooLong',
      validator: {
        validate(value: string): boolean {
          return !value || value.length <= 200;
        },
        defaultMessage: buildMessage(
          (eachPrefix) =>
            eachPrefix +
            'The description cannot be longer than 200 characters.',
          validationOptions,
        ),
      },
    },
    validationOptions,
  );
}
