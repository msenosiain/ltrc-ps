import { createSlice,type PayloadAction } from "@reduxjs/toolkit"

type SidebarSectionType = "plantel" | "divisiones" | "ejercicios" | null

interface UIState {
  sidebarSection: SidebarSectionType
}

const initialState: UIState = {
  sidebarSection: "divisiones" // abre Divisiones por default
}

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebarSection(state, action: PayloadAction<SidebarSectionType>) {
      state.sidebarSection =
        state.sidebarSection === action.payload ? null : action.payload
    }
  }
})

export const { toggleSidebarSection } = uiSlice.actions
export const uiSliceReducer = uiSlice.reducer
export default uiSliceReducer
