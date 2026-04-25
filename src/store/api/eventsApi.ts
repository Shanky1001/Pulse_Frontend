import type { NormalizedReport } from '@/types/ga4';
import { sleep } from '@/lib/sleep';
import { baseApi } from './baseApi';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

export type EventNameRow = { name: string; count: number };

const MOCK_EVENT_NAMES: EventNameRow[] = [
  { name: 'page_view', count: 124_321 },
  { name: 'session_start', count: 38_211 },
  { name: 'first_visit', count: 12_002 },
  { name: 'click', count: 9_842 },
  { name: 'scroll', count: 8_120 },
  { name: 'video_start', count: 4_310 },
  { name: 'video_complete', count: 1_298 },
  { name: 'sign_up', count: 612 },
  { name: 'login', count: 542 },
  { name: 'purchase', count: 211 },
];

function buildBody(propertyId: string) {
  return {
    propertyId,
    metrics: ['eventCount'],
    dimensions: ['eventName'],
    dateRange: { preset: 'last90d' as const },
    orderBys: [{ fieldName: 'eventCount', desc: true }],
    limit: 200,
  };
}

export const eventsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listEventNames: builder.query<EventNameRow[], string>(
      USE_MOCKS
        ? {
            queryFn: async () => {
              await sleep(150);
              return { data: MOCK_EVENT_NAMES };
            },
            keepUnusedDataFor: 600,
          }
        : {
            query: (propertyId) => ({
              url: '/query',
              method: 'POST',
              body: buildBody(propertyId),
            }),
            transformResponse: (resp: NormalizedReport): EventNameRow[] => {
              const rows = resp.rows ?? [];
              const out = rows
                .map((r) => ({
                  name: String(r.eventName ?? ''),
                  count: Number(r.eventCount ?? 0),
                }))
                .filter((r) => r.name.length > 0);
              out.sort((a, b) => b.count - a.count);
              return out;
            },
            keepUnusedDataFor: 600,
          },
    ),
  }),
  overrideExisting: false,
});

export const { useListEventNamesQuery } = eventsApi;
