import { usePreviewData } from '@/hooks/preview-data/usePreviewData';
import type { ToolQueryStore } from '@/types/chat-type';
import TableView from './TableView';

function ShowQueryStore({
  toolQueryStore,
}: {
  toolQueryStore: ToolQueryStore;
}) {
  const { data: previewData, isLoading } = usePreviewData({
    queryId: toolQueryStore.content.query_id,
  });

  if (isLoading) {
    return <p>Loading...</p>;
  }

  switch (previewData?.data?.response_type) {
    case 'sentence':
      return <p>{previewData.data.output_text}</p>;
    case 'table':
      return previewData.data.data ? (
        <TableView data={previewData.data.data} />
      ) : (
        <p>No table data available</p>
      );
    case 'bar_chart':
    case 'line_chart':
    case 'pie_chart':
      return <pre>{JSON.stringify(previewData.data, null, 2)}</pre>;
    default:
      return <pre>{JSON.stringify(previewData, null, 2)}</pre>;
  }
}

export default ShowQueryStore;
