import { IsNumber, IsUUID } from 'class-validator';

export class CreateGameDto {
  @IsUUID('7')
  userId: string;

  @IsNumber()
  seats: number;
}
