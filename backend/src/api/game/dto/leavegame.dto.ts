import { IsUUID } from 'class-validator';

export class LeaveGameDto {
  @IsUUID('7')
  userId: string;
}
