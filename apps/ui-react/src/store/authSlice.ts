import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { psApi } from '../lib/axios'

export interface AuthUser {
  _id: string
  email: string
  firstName: string
  lastName: string
  rol: 'admin' | 'entrenador' | 'jugador'
  divisionIds: string[]
}

interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  loading: false,
  error: null,
}

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const { data } = await psApi.post('/auth/login', credentials)
      return data
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Error al iniciar sesión')
    }
  },
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null
      state.accessToken = null
      state.refreshToken = null
      state.isAuthenticated = false
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    },
    setTokens(state, action: PayloadAction<{ accessToken: string; refreshToken?: string }>) {
      state.accessToken = action.payload.accessToken
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken
      }
      state.isAuthenticated = true
      localStorage.setItem('accessToken', action.payload.accessToken)
      if (action.payload.refreshToken) {
        localStorage.setItem('refreshToken', action.payload.refreshToken)
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.accessToken = action.payload.accessToken
        state.refreshToken = action.payload.refreshToken
        state.isAuthenticated = true
        localStorage.setItem('accessToken', action.payload.accessToken)
        localStorage.setItem('refreshToken', action.payload.refreshToken)
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { logout, setTokens } = authSlice.actions
export const authReducer = authSlice.reducer
export default authReducer
