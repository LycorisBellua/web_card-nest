import { Matches, MaxLength } from 'class-validator';

export class UpdateAvatarDto {
  @MaxLength(255)
  @Matches(/^(?:.*[/\\])?[^/\\]+\.png$/i, {
    message: 'Avatar must be a valid .png file path',
  })
  avatar: string;
}
