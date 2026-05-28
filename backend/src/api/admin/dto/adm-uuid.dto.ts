import { IsUUID } from 'class-validator';

export class AdmUuidDto {
  @IsUUID()
  targetId: string;
}
