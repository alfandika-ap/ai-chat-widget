import api from "@/lib/api";
import type { ChatItem } from "@/types/chat-type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { getToken } from '@/services/token';

// Types untuk streaming events
interface StreamEvent {
  type: 'start' | 'text_delta' | 'tool_call_start' | 'tool_call_result' | 'completion' | 'error' | 'end';
  content?: any;
  timestamp?: number;
  tool_name?: string;
  tool_id?: string;
  arguments?: any;
  status?: string;
  error_code?: string;
}

interface ToolCall {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'error';
  arguments: any;
  result?: any;
}

export const useChatList = () => {
  return useQuery({
    queryKey: ['chat-list'],
    queryFn: () => api.get<ChatItem[]>('/chat/list'),
  });
};

export const useChatStream = () => {
  const queryClient = useQueryClient();
  const [input, setInput] = useState('');
  const inputLength = input.trim().length;
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toolCalls, setToolCalls] = useState<ToolCall[]>([]);

  const handleStreamEvent = (event: StreamEvent) => {
    switch (event.type) {
      case 'start':
        console.log('Stream started:', event.content?.message);
        setStreamingMessage('');
        setToolCalls([]);
        break;

      case 'text_delta':
        setStreamingMessage(prev => prev + event.content);
        break;

      case 'tool_call_start':
        const newToolCall: ToolCall = {
          id: event.tool_id || Date.now().toString(),
          name: event.tool_name || 'unknown',
          status: 'running',
          arguments: event.arguments || {},
        };
        setToolCalls(prev => [...prev, newToolCall]);
        break;

      case 'tool_call_result':
        setToolCalls(prev => 
          prev.map(tool => 
            tool.id === event.tool_id || tool.name === event.tool_name
              ? { ...tool, status: 'completed' as const, result: event.content }
              : tool
          )
        );
        break;

      case 'completion':
        console.log('Message completed');
        break;

      case 'error':
        console.error('Stream error:', event.content, event.error_code);
        setError(`Error: ${event.content} (${event.error_code || 'UNKNOWN'})`);
        break;

      case 'end':
        console.log('Stream ended:', event.content?.message);
        break;

      default:
        console.log('Unknown event type:', event.type, event);
    }
  };

  const handleSendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    if (inputLength === 0) return;
    
    const userInput = input;
    setError(null);
    setInput('');
    setIsStreaming(true);
    setStreamingMessage('');
    setToolCalls([]);

    // Optimistically update user message
    const userMessage: ChatItem = {
      id: Date.now(),
      type: 'user',
      content: userInput,
      user_id: 0, // Ganti jika ada user_id
    };
    
    queryClient.setQueryData(['chat-list'], (old: any) => {
      if (!old?.data) return { data: [userMessage] };
      return { ...old, data: [...old.data, userMessage] };
    });

    try {
      const response = await fetch("http://localhost:8000/api/v1/chat/stream", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ query: userInput }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let finalAiContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Append chunk to buffer
        buffer += decoder.decode(value, { stream: true });

        // Process complete lines (NDJSON)
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.trim()) {
            try {
              const event: StreamEvent = JSON.parse(line);
              console.log('event: ', event);
              handleStreamEvent(event);
              
              // Keep track of final content untuk disimpan
              if (event.type === 'completion' && event.content) {
                finalAiContent = event.content;
              }
            } catch (parseError) {
              console.warn('Failed to parse JSON line:', line, parseError);
            }
          }
        }
      }

      // Process any remaining buffer
      if (buffer.trim()) {
        try {
          const event: StreamEvent = JSON.parse(buffer);
          handleStreamEvent(event);
          if (event.type === 'completion' && event.content) {
            finalAiContent = event.content;
          }
        } catch (parseError) {
          console.warn('Failed to parse final JSON:', buffer, parseError);
        }
      }

      // Add final AI message to chat list
      const aiMessage: ChatItem = {
        id: Date.now() + 1,
        type: 'assistant',
        content: finalAiContent || streamingMessage,
        user_id: 0,
      };

      queryClient.setQueryData(['chat-list'], (old: any) => {
        if (!old?.data) return { data: [aiMessage] };
        return { ...old, data: [...old.data, aiMessage] };
      });

      setStreamingMessage('');
      setToolCalls([]);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Error: ${errorMessage}`);
      setStreamingMessage('');
      setToolCalls([]);
      
      // Remove optimistic user message on error jika diperlukan
      // queryClient.setQueryData(['chat-list'], (old: any) => {
      //   if (!old?.data) return old;
      //   return { ...old, data: old.data.filter((msg: ChatItem) => msg.id !== userMessage.id) };
      // });
    } finally {
      setIsStreaming(false);
    }
  };

  return {
    input,
    setInput,
    inputLength,
    streamingMessage,
    isStreaming,
    error,
    toolCalls, // Tambahan untuk menampilkan tool calls
    handleSendMessage,
  };
};

export const useClearChat = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post('/chat/clear-chat'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-list'] });
    },
  });
};