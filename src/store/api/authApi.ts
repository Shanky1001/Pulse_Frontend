import { baseApi } from './baseApi';

export type AuthMe = {
  connected: boolean;
  user?: { name: string; email: string; picture?: string };
  connectedAt?: string;
};

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query<AuthMe, void>({
      query: () => ({ url: '/auth/me', method: 'GET' }),
      providesTags: ['Me'],
    }),
    disconnect: builder.mutation<void, void>({
      query: () => ({ url: '/auth/disconnect', method: 'POST' }),
      invalidatesTags: ['Me', 'Properties', 'Dashboards', 'Dashboard', 'Query', 'Catalog'],
    }),
    refreshSession: builder.mutation<
      { ok: true; user: { name: string; email: string; picture?: string }; expiresIn: number },
      void
    >({
      query: () => ({ url: '/auth/refresh', method: 'POST' }),
      invalidatesTags: ['Me'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetMeQuery, useDisconnectMutation, useRefreshSessionMutation } = authApi;

export const googleLoginUrl = '/api/auth/google';
