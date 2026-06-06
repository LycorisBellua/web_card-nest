import { isUUID, IsUUID } from 'class-validator';

export class InviteGameDto {
  @isUUID('7')
  leaderId: string;

  @isUUID('7')
  gameId: string;

  @IsUUID('7')
  invitedId: string;
}
