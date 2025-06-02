import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useChatList, useChatStream, useClearChat } from '@/hooks/chat/useChat';
import { cn } from '@/lib/utils';
import { Loader2, MessageSquare, Send, Trash2 } from 'lucide-react';
import ChatContent from './chat-content';
import { useEffect, useRef } from 'react';

function Chat() {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { data: messages, isLoading: isMessagesLoading } = useChatList();
  const {
    input,
    setInput,
    inputLength,
    streamingMessage,
    isStreaming,
    error,
    handleSendMessage,
  } = useChatStream();
  const { mutate: clearChat, isPending: isClearChatPending } = useClearChat();

  // Auto scroll to bottom when new messages arrive or during streaming
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages?.data, streamingMessage]);

  return (
    <Card className="border-none shadow-none h-full flex flex-col py-4">
      <CardHeader className="flex flex-row items-center flex-shrink-0 relative">
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage
              src="https://carabaobilliards.com/wp-content/uploads/2023/06/logo-website-carabao-2023.png"
              alt="Carabao AI"
            />
            <AvatarFallback>CA</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium leading-none">Carabao AI</p>
            <p className="text-sm text-muted-foreground">
              Your Smart Assistant
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-8 -top-2.5"
          onClick={() => clearChat()}
          disabled={isClearChatPending}
        >
          {isClearChatPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </Button>
      </CardHeader>
      <CardContent ref={chatContainerRef} className="flex-1 overflow-y-auto">
        {isMessagesLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-[60%]" />
            <Skeleton className="h-12 w-[50%]" />
            <Skeleton className="h-12 w-[70%]" />
          </div>
        ) : messages?.data.length === 0 && !isStreaming ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No Messages Yet</h3>
            <p className="text-sm text-muted-foreground">
              Start a conversation with Carabao AI. Ask anything!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages?.data.map((message, index) => (
              <div
                key={index}
                className={cn(
                  'flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm',
                  message.type === 'user'
                    ? 'ml-auto bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                <ChatContent chat={message} />
              </div>
            ))}
            {isStreaming && (
              <div
                className={cn(
                  'flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm bg-muted'
                )}
              >
                {streamingMessage}
                <div className="flex gap-1 mt-1">
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                </div>
              </div>
            )}
          </div>
        )}
        {error && <div className="text-red-500 text-xs mt-2">{error}</div>}
      </CardContent>
      <CardFooter className="flex-shrink-0">
        <form
          onSubmit={handleSendMessage}
          className="flex w-full items-center space-x-2"
        >
          <Input
            id="message"
            placeholder="Type your message..."
            className="flex-1"
            autoComplete="off"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            disabled={isStreaming}
          />
          <Button
            type="submit"
            size="icon"
            disabled={inputLength === 0 || isStreaming}
          >
            {isStreaming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send />
            )}
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}

export default Chat;
