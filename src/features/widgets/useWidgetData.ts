import type { Widget } from '@/types/dashboard';
import { useRunReportQuery } from '@/store/api/queryApi';

export function useWidgetData(widget: Widget) {
  const { data, isLoading, isFetching, error, refetch } = useRunReportQuery(widget.query, {
    skip: !widget.query.propertyId || widget.query.metrics.length === 0,
  });
  return { data, isLoading, isFetching, error, refetch };
}
