import {
  IsEmailFormatValid,
  IsEmailNotEmpty,
} from '../utils/user.validator';

export class ForgotPasswordDto {
  @IsEmailNotEmpty()
  @IsEmailFormatValid()
  email: string;
}