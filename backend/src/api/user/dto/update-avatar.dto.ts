import {
  IsAvatarDimensionsValid,
  IsAvatarNotTooBig,
  IsAvatarPng,
} from '../utils/user.validator';

export class UpdateAvatarDto {
  // The avatar is stored as a base64-encoded string (blob) in the DB.
  @IsAvatarPng()
  @IsAvatarNotTooBig()
  @IsAvatarDimensionsValid()
  avatar: string;
}
