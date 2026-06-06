import { IsUUID } from 'class-validator';

export class JoinGameDto {
  @IsUUID('7')
  joinerId: string;

  @IsUUID('7')
  gameId: string;
}
