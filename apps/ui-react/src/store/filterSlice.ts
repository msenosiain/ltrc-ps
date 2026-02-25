import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface FiltersState {
  division?: string
  equipo?: string
}

const initialState: FiltersState = {}

const filtersSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    setDivision(state, action: PayloadAction<string>) {
      state.division = action.payload
      state.equipo = undefined
    },
    setEquipo(state, action: PayloadAction<string>) {
      state.equipo = action.payload
    }
  }
})

export const { setDivision, setEquipo } = filtersSlice.actions
export const filtersReducer = filtersSlice.reducer
export default filtersReducer