import { createSlice } from '@reduxjs/toolkit';

export const Roles = {
  ADMIN: 'admin',
  DOCTOR: 'doctor',
  PATIENT: 'patient',
  NURSE: 'nurse',
  RECEPTIONIST: 'receptionist',
  PHARMACIST: 'pharmacist',
  LAB: 'lab',
};

const initialUser = JSON.parse(localStorage.getItem('hms_user')) || null;

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: initialUser, // { id, name, email, role, token }
    isAuthenticated: Boolean(initialUser),
  },
  reducers: {
    loginSuccess(state, action) {
      state.user = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem('hms_user', JSON.stringify(action.payload));
    },
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('hms_user');
    },
    registerSuccess(state, action) {
      state.user = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem('hms_user', JSON.stringify(action.payload));
    },
  },
});

export const { loginSuccess, logout, registerSuccess } = authSlice.actions;
export default authSlice.reducer;