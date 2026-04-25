import type { WidgetQuery } from '@/types/dashboard';
import type { NormalizedReport } from '@/types/ga4';
import { generateReport } from '@/lib/mockGa4';
import { hashArgs } from '@/lib/hashArgs';
import { sleep } from '@/lib/sleep';
import { baseApi } from './baseApi';

const USE_MOCKS =
  import.meta.env.VITE_USE_MOCKS === 'true' ||
  (typeof window !== 'undefined' &&
    window.localStorage?.getItem('pulse.localTestSession.v1') === '1');

export const queryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    runReport: builder.query<NormalizedReport, WidgetQuery>(
      USE_MOCKS
        ? {
            queryFn: async (arg) => {
              await sleep(250 + Math.floor(Math.random() * 200));
              return { data: generateReport(arg) };
            },
            providesTags: (_r, _e, arg) => [{ type: 'Query', id: hashArgs(arg) }],
            keepUnusedDataFor: 60,
            serializeQueryArgs: ({ queryArgs }) => hashArgs(queryArgs),
          }
        : {
            query: (arg) => ({
              url: '/query',
              method: 'POST',
              body: arg,
            }),
            providesTags: (_r, _e, arg) => [{ type: 'Query', id: hashArgs(arg) }],
            keepUnusedDataFor: 60,
            serializeQueryArgs: ({ queryArgs }) => hashArgs(queryArgs),
          },
    ),
  }),
  overrideExisting: false,
});

export const { useRunReportQuery } = queryApi;
