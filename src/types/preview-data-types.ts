export type PreviewDataResponseType = "sentence" | "table" | "bar_chart" | "line_chart" | "pie_chart";

export type PreviewDataResponse = {
  response_type: PreviewDataResponseType;
  status: 'success';
  output_text?: string;
  page?: number;
  limit?: number;
  total?: number;
  data?: Record<string, any>[];
};