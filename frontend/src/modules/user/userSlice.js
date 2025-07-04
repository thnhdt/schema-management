import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  token: null,
  roles: [],
  userId: null,
  username: null,
  isAuthenticated: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { token, roles, userId, username } = action.payload;
      state.token = token;
      state.roles = roles || [];
      state.userId = userId;
      state.username = username;
      state.isAuthenticated = !!token;
    },
    logout: (state) => {
      state.token = null;
      state.roles = [];
      state.userId = null;
      state.username = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setCredentials, logout } = userSlice.actions;
export default userSlice.reducer; 