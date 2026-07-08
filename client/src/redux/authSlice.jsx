// src/redux/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const storedUser = localStorage.getItem('authUser') || sessionStorage.getItem('authUser');

const initialState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  isAuthenticated: !!storedUser
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    clearAuthUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    }
  }
});

export const { setAuthUser, clearAuthUser } = authSlice.actions;
export default authSlice.reducer;