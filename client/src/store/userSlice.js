import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  value: null,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action) => {
      state.value = action.payload; // { username, role }
    },
    logout: (state) => {
      state.value = null;
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("username");
    },
  },
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;
