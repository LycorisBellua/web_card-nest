import { IsUUID } from 'class-validator';

export class RelUuidDto {
  @IsUUID()
  targetId: string;
}
