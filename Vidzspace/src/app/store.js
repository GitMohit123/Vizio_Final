import { configureStore } from '@reduxjs/toolkit'
import appReducer from '.'

export const store = configureStore({
  reducer: appReducer
})