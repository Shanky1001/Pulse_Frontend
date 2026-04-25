import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { Mutex } from 'async-mutex';

import { disconnect } from '@/store/slices/authSlice';

const rawBaseQuery = fetchBaseQuery({ baseUrl: '/api', credentials: 'include' });

const refreshMutex = new Mutex();

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  const argUrl = typeof args === 'string' ? args : args.url;
  const isAuthEndpoint = argUrl.startsWith('/auth/');

  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status !== 401 || isAuthEndpoint) {
    return result;
  }

  await refreshMutex.waitForUnlock();

  if (!refreshMutex.isLocked()) {
    const release = await refreshMutex.acquire();
    try {
      const refreshResult = await rawBaseQuery(
        { url: '/auth/refresh', method: 'POST' },
        api,
        extraOptions,
      );
      if (refreshResult.error) {
        api.dispatch(disconnect());
        return result;
      }
      result = await rawBaseQuery(args, api, extraOptions);
      if (result.error?.status === 401) {
        api.dispatch(disconnect());
      }
    } finally {
      release();
    }
  } else {
    await refreshMutex.waitForUnlock();
    result = await rawBaseQuery(args, api, extraOptions);
    if (result.error?.status === 401) {
      api.dispatch(disconnect());
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Me', 'Properties', 'Dashboards', 'Dashboard', 'Query', 'Catalog'],
  endpoints: () => ({}),
});
