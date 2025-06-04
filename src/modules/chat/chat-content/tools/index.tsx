import type { ToolCallResult } from '@/types/chat-type';
import ShowQueryStore from './show-query-store';

const Tools = ({ toolCallResult }: { toolCallResult: ToolCallResult }) => {
  switch (toolCallResult.tool_name) {
    case 'show_query_store':
      return <ShowQueryStore toolQueryStore={toolCallResult} />;
  }
};

export default Tools;
