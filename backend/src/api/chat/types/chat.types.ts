export type ChatParticipants = {
  userAId: string;
  userBId: string;
};

export type NewMessage = {
  chatId: string;
  senderId: string;
  message: string;
};
