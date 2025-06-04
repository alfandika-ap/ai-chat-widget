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
import { Badge } from '@/components/ui/badge';
import { useChatList, useChatStream, useClearChat } from '@/hooks/chat/useChat';
import { cn } from '@/lib/utils';
import {
  Loader2,
  MessageSquare,
  Send,
  Trash2,
  Settings,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import ChatContent from './chat-content';
import { useEffect, useRef } from 'react';

// Component untuk menampilkan tool calls
interface ToolCall {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'error';
  arguments: any;
  result?: any;
}

interface ToolCallDisplayProps {
  toolCall: ToolCall;
}

const ToolCallDisplay: React.FC<ToolCallDisplayProps> = ({ toolCall }) => {
  const getStatusIcon = () => {
    switch (toolCall.status) {
      case 'running':
        return <Clock className="w-3 h-3 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-3 h-3 text-red-500" />;
      default:
        return <Settings className="w-3 h-3 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (toolCall.status) {
      case 'running':
        return 'border-blue-200 bg-blue-50';
      case 'completed':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className={`mt-2 p-2 border rounded-md text-xs ${getStatusColor()}`}>
      <div className="flex items-center gap-2 mb-1">
        {getStatusIcon()}
        <span className="font-medium">Tool: {toolCall.name}</span>
        <Badge variant="outline" className="text-[10px] px-1 py-0">
          {toolCall.status}
        </Badge>
      </div>

      {Object.keys(toolCall.arguments).length > 0 && (
        <div className="mb-1">
          <div className="font-medium mb-1">Arguments:</div>
          <pre className="text-[10px] bg-white bg-opacity-70 p-1 rounded border overflow-x-auto">
            {JSON.stringify(toolCall.arguments, null, 2)}
          </pre>
        </div>
      )}

      {toolCall.result && (
        <div>
          <div className="font-medium mb-1">Result:</div>
          <div className="text-[10px] bg-white bg-opacity-70 p-1 rounded border max-h-20 overflow-y-auto">
            {typeof toolCall.result === 'string'
              ? toolCall.result
              : JSON.stringify(toolCall.result, null, 2)}
          </div>
        </div>
      )}
    </div>
  );
};

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
    toolCalls, // <- Tool calls dari hook baru
    handleSendMessage,
  } = useChatStream();
  const { mutate: clearChat, isPending: isClearChatPending } = useClearChat();

  // Auto scroll to bottom when new messages arrive or during streaming
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages?.data, streamingMessage, toolCalls]);

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
                <ChatContent
                  chat={message}
                  isAssistant={message.type === 'assistant'}
                />
              </div>
            ))}

            {/* Streaming message dengan tool calls */}
            {isStreaming && (
              <div
                className={cn(
                  'flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm bg-muted'
                )}
              >
                {/* Streaming text content */}
                {streamingMessage && <div>{streamingMessage}</div>}

                {/* Tool calls display */}
                {toolCalls.length > 0 && (
                  <div className="space-y-1">
                    {toolCalls.map((toolCall) => (
                      <ToolCallDisplay key={toolCall.id} toolCall={toolCall} />
                    ))}
                  </div>
                )}

                {/* Loading indicator - hanya tampil jika ada streaming atau tool calls aktif */}
                {(isStreaming ||
                  toolCalls.some((t) => t.status === 'running')) && (
                  <div className="flex gap-1 mt-1">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center gap-2 text-red-700 text-xs">
              <AlertCircle className="w-3 h-3" />
              <span>{error}</span>
            </div>
          </div>
        )}
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
