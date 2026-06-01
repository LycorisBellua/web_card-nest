import { IsUUID } from 'class-validator';

export class RelUuidDto {
  @IsUUID('7')
  targetId: string;
}
