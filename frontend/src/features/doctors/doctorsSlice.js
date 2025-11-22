import { createSlice, nanoid } from '@reduxjs/toolkit';

const initialState = {
  list: [
    { id: 'd1', name: 'Dr. Alice Williams', specialty: 'Cardiology', availability: ['Mon', 'Wed', 'Fri'], schedule: [] },
    { id: 'd2', name: 'Dr. Bob Johnson', specialty: 'Neurology', availability: ['Tue', 'Thu'], schedule: [] },
  ],
};

const doctorsSlice = createSlice({
  name: 'doctors',
  initialState,
  reducers: {
    setList(state, action) {
      state.list = action.payload;
    },
    addDoctor: {
      reducer(state, action) { state.list.push(action.payload); },
      prepare(data) { return { payload: { id: nanoid(), ...data } }; },
    },
    updateDoctor(state, action) {
      const { id, changes } = action.payload;
      const idx = state.list.findIndex(d => d.id === id);
      if (idx !== -1) state.list[idx] = { ...state.list[idx], ...changes };
    },
    removeDoctor(state, action) {
      state.list = state.list.filter(d => d.id !== action.payload);
    },
    addScheduleEntry(state, action) {
      const { doctorId, entry } = action.payload;
      const doctor = state.list.find(d => d.id === doctorId);
      if (doctor) doctor.schedule.push(entry);
    },
  },
});

export const { setList, addDoctor, updateDoctor, removeDoctor, addScheduleEntry } = doctorsSlice.actions;
export default doctorsSlice.reducer;