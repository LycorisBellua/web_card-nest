import { IsUUID } from 'class-validator';

export class AdmUuidDto {
  @IsUUID('7')
  targetId: string;
}
