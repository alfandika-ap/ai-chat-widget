export type ChatItem = {
  id: number;
  type: 'user' | 'assistant';
  content: string;
  user_id: number;
}