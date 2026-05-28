import { IsUUID } from 'class-validator';

export class MessageUuidDto {
  @IsUUID()
  messageId: string;
}
