import { configureStore } from "@reduxjs/toolkit"
import filtersReducer from "./filterSlice"
import uiSliceReducer from "./uiSlice"
import authReducer from "./authSlice"


export const store = configureStore({
  reducer: {
    filters: filtersReducer,
    ui: uiSliceReducer,
    auth: authReducer,
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
