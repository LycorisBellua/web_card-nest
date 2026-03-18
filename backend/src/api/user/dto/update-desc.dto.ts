import { Matches, MaxLength } from 'class-validator';

export class UpdateDescDto {
  @Matches(/^\P{C}*$/u)
  @MaxLength(200)
  desc: string;
}
