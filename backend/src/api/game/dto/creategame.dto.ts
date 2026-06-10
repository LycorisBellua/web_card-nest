import { IsNumber, IsString, IsUUID } from 'class-validator';

export class CreateGameDto {
  @IsUUID('7')
  userId: string;

  @IsString()
  username: string;

  @IsNumber()
  seats: number;
}
