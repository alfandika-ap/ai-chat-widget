import api from "@/lib/api";
import type { ChatItem } from "@/types/chat-type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { getToken } from '@/services/token';

export const useChatList = () => {
  return useQuery({
    queryKey: ['chat-list'],
    queryFn: () => api.get<ChatItem[]>('/chat/list'),
  });
};

const API_URL = 'http://localhost:8000/chat/stream'; // Ganti sesuai URL BE kamu
const TOKEN = getToken(); // Ganti dengan token user yang valid

export const useChatStream = () => {
  const queryClient = useQueryClient();
  const [input, setInput] = useState('');
  const inputLength = input.trim().length;
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    if (inputLength === 0) return;
    setError(null);
    setInput('');
    setIsStreaming(true);
    setStreamingMessage('');

    // Optimistically update user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: input,
      user_id: 0, // Ganti jika ada user_id
    };
    queryClient.setQueryData(['chat-list'], (old: any) => {
      if (!old?.data) return { data: [userMessage] };
      return { ...old, data: [...old.data, userMessage] };
    });

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify({ query: input }),
      });

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        aiContent += chunk;
        setStreamingMessage(aiContent); // Update UI streaming
      }

      // Tambahkan pesan AI ke cache
      const aiMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: aiContent,
        user_id: 0, // Ganti jika ada user_id
      };
      queryClient.setQueryData(['chat-list'], (old: any) => {
        if (!old?.data) return { data: [aiMessage] };
        return { ...old, data: [...old.data, aiMessage] };
      });
      setStreamingMessage('');
    } catch (err) {
      setError('Error: ' + (err instanceof Error ? err.message : String(err)));
      setStreamingMessage('');
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