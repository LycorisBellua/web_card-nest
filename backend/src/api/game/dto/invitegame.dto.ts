import { IsUUID } from 'class-validator';

export class InviteGameDto {
  @IsUUID('7')
  leaderId: string;

  @IsUUID('7')
  gameId: string;

  @IsUUID('7')
  invitedId: string;
}
