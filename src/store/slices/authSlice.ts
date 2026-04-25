import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type AuthUser = {
  name: string;
  email: string;
};

export type AuthState = {
  connected: boolean;
  user?: AuthUser;
};

const initialState: AuthState = {
  connected: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    connect(state, action: PayloadAction<{ user: AuthUser }>) {
      state.connected = true;
      state.user = action.payload.user;
    },
    disconnect(state) {
      state.connected = false;
      state.user = undefined;
    },
  },
});

export const { connect, disconnect } = authSlice.actions;
export default authSlice.reducer;
