import type { ChatItem, ToolCallResult } from '@/types/chat-type';
import { useMemo } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Tools from './tools';

const ChatContent = ({
  chat,
  isAssistant,
}: {
  chat: ChatItem;
  isAssistant: boolean;
}) => {
  const parseChatContent = useMemo(() => {
    try {
      const parsedContent = JSON.parse(`${chat.content}`);
      return parsedContent as Record<string, any>;
    } catch (error) {
      return chat.content;
    }
  }, [chat.content, isAssistant]);

  if (
    typeof parseChatContent === 'object' &&
    parseChatContent?.type === 'tool_call_result'
  ) {
    return <Tools toolCallResult={parseChatContent as ToolCallResult} />;
  }

  if (typeof parseChatContent === 'object') {
    return <pre>{JSON.stringify(parseChatContent, null, 2)}</pre>;
  }

  return (
    <div className="prose prose-sm prose-pre:bg-transparent prose-pre:p-0">
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          ol: ({ children }) => <ol className="list-decimal">{children}</ol>,
          ul: ({ children }) => <ul className="list-disc">{children}</ul>,
          li: ({ children }) => <li className="ml-4">{children}</li>,
        }}
      >
        {chat.content}
      </Markdown>
    </div>
  );
};

export default ChatContent;
