export enum ChatError {
  NOT_FOUND = 'Either the sender/receiver does not exist.',
  TOO_LONG = 'Messages are limited to 500 characters',
  BANNED = 'The user is banned from the lobby chat.',
  WRONG_CHAT = 'The user is not a participant in this chat.',
}
