import { createSlice, nanoid } from '@reduxjs/toolkit';

const initialState = {
  list: [
    { id: 'a1', patientId: 'p1', doctorId: 'd1', date: '2025-10-10', time: '10:00', status: 'scheduled', notes: '' },
  ],
};

const appointmentsSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    setList(state, action) {
      state.list = action.payload;
    },
    addAppointment: {
      reducer(state, action) { state.list.push(action.payload); },
      prepare(data) { return { payload: { id: nanoid(), status: 'scheduled', ...data } }; },
    },
    updateAppointment(state, action) {
      const { id, changes } = action.payload;
      const idx = state.list.findIndex(a => a.id === id);
      if (idx !== -1) state.list[idx] = { ...state.list[idx], ...changes };
    },
    cancelAppointment(state, action) {
      const appt = state.list.find(a => a.id === action.payload);
      if (appt) appt.status = 'cancelled';
    },
  },
});

export const { setList, addAppointment, updateAppointment, cancelAppointment } = appointmentsSlice.actions;
export default appointmentsSlice.reducer;