import type { ChatItem } from '@/types/chat-type';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ChatContent = ({ chat }: { chat: ChatItem }) => {
  return (
    <div className="prose prose-sm prose-pre:bg-transparent prose-pre:p-0">
      <Markdown remarkPlugins={[remarkGfm]}>{chat.content}</Markdown>
    </div>
  );
};

export default ChatContent;
