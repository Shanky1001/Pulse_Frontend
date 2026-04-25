import { sleep } from '@/lib/sleep';
import { baseApi } from './baseApi';

export type GA4Property = {
  propertyId: string;
  propertyName: string;
  accountName: string;
  timeZone: string;
  currencyCode: string;
};

const USE_MOCKS =
  import.meta.env.VITE_USE_MOCKS === 'true' ||
  (typeof window !== 'undefined' &&
    window.localStorage?.getItem('pulse.localTestSession.v1') === '1');

const MOCK_PROPERTIES: GA4Property[] = [
  {
    propertyId: '123456789',
    propertyName: 'Acme Web',
    accountName: 'Acme Inc.',
    timeZone: 'America/Los_Angeles',
    currencyCode: 'USD',
  },
  {
    propertyId: '987654321',
    propertyName: 'Acme iOS',
    accountName: 'Acme Inc.',
    timeZone: 'America/Los_Angeles',
    currencyCode: 'USD',
  },
];

export const propertiesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listProperties: builder.query<GA4Property[], void>(
      USE_MOCKS
        ? {
            queryFn: async () => {
              await sleep(120);
              return { data: MOCK_PROPERTIES };
            },
            providesTags: ['Properties'],
            keepUnusedDataFor: 600,
          }
        : {
            query: () => ({ url: '/properties', method: 'GET' }),
            providesTags: ['Properties'],
            keepUnusedDataFor: 600,
          },
    ),
  }),
  overrideExisting: false,
});

export const { useListPropertiesQuery } = propertiesApi;
