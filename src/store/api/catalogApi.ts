import type { GA4DimensionDef, GA4MetricDef } from '@/types/ga4';
import { DIMENSIONS, METRICS } from '@/lib/ga4Catalog';
import { sleep } from '@/lib/sleep';
import { baseApi } from './baseApi';

const USE_MOCKS =
  import.meta.env.VITE_USE_MOCKS === 'true' ||
  (typeof window !== 'undefined' &&
    window.localStorage?.getItem('pulse.localTestSession.v1') === '1');

export type MetricsDimensionsCatalog = {
  metrics: GA4MetricDef[];
  dimensions: GA4DimensionDef[];
};

export const STATIC_CATALOG: MetricsDimensionsCatalog = {
  metrics: METRICS,
  dimensions: DIMENSIONS,
};

export const catalogApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCatalog: builder.query<MetricsDimensionsCatalog, string>(
      USE_MOCKS
        ? {
            queryFn: async () => {
              await sleep(80);
              return { data: STATIC_CATALOG };
            },
            providesTags: ['Catalog'],
            keepUnusedDataFor: 86_400,
          }
        : {
            query: (propertyId) => ({
              url: `/catalog?propertyId=${encodeURIComponent(propertyId)}`,
              method: 'GET',
            }),
            providesTags: (_r, _e, propertyId) => [{ type: 'Catalog', id: propertyId }],
            keepUnusedDataFor: 86_400,
          },
    ),
  }),
  overrideExisting: false,
});

export const { useGetCatalogQuery } = catalogApi;
