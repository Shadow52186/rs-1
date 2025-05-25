import { configureStore } from '@reduxjs/toolkit'
import userSlice from './userSlice'

export const store = configureStore({
  reducer: {
    user: userSlice,
  },
  devTools: true  // ✅ เปิด Redux DevTools support
})
