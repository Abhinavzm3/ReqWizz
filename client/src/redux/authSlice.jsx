import { createSlice } from '@reduxjs/toolkit';

const storedUser = localStorage.getItem('authUser') || sessionStorage.getItem('authUser');

let parsedUser = null;
try {
  if (storedUser && storedUser !== 'undefined') {
    parsedUser = JSON.parse(storedUser);
  }
} catch (e) {
  console.error("Failed to parse authUser from storage", e);
}

const initialState = {
  user: parsedUser,
  isAuthenticated: !!parsedUser
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