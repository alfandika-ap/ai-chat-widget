// @/types/chat-type.ts (update existing atau tambah yang baru)

export interface ChatItem {
  id: number;
  type: 'user' | 'assistant';
  content: string;
  user_id: number;
  created_at?: string;
  updated_at?: string;
}

// Types untuk streaming events
export interface StreamEvent {
  type: 'start' | 'text_delta' | 'tool_call_start' | 'tool_call_result' | 'completion' | 'error' | 'end';
  content?: any;
  timestamp?: number;
  tool_name?: string;
  tool_id?: string;
  arguments?: any;
  status?: string;
  error_code?: string;
}

// Types untuk tool calls
export interface ToolCall {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'error';
  arguments: Record<string, any>;
  result?: any;
  timestamp?: number;
}

// Types untuk chat stream input
export interface ChatStreamInput {
  query: string;
}

// {'type': 'tool_call_result', 'tool_name': 'show_query_store', 'content': {'query_id': 6}, 'status': 'success'}
export type ToolName = 'show_query_store';

export type ToolQueryStore = {
  type: 'tool_call_result';
  tool_name: ToolName;
  content: { query_id: number };
  status: 'success';
}


export type ToolCallResult = ToolQueryStore;
