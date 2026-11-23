export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile extends User {
  telegramChatId?: string;
  preferences?: Record<string, unknown>;
}
