import { Matches, MaxLength } from 'class-validator';

export class UpdateDescDto {
  @MaxLength(200)
  @Matches(/^\P{C}*$/u, {
    message: 'Must be a string containing only non-control characters',
  })
  desc: string;
}
