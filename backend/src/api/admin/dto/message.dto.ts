import { IsUUID } from 'class-validator';

export class MessageUuidDto {
  @IsUUID('7')
  messageId: string;
}
