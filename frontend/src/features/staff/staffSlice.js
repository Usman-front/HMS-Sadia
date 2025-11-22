import { createSlice, nanoid } from '@reduxjs/toolkit';

const initialState = {
  list: [
    { id: 's1', name: 'Nurse Emma', role: 'nurse', shift: 'Day' },
    { id: 's2', name: 'Receptionist Mike', role: 'receptionist', shift: 'Evening' },
  ],
};

const staffSlice = createSlice({
  name: 'staff',
  initialState,
  reducers: {
    setList(state, action) {
      state.list = action.payload;
    },
    addStaff: {
      reducer(state, action) { state.list.push(action.payload); },
      prepare(data) { return { payload: { id: nanoid(), ...data } }; },
    },
    updateStaff(state, action) {
      const { id, changes } = action.payload;
      const idx = state.list.findIndex(s => s.id === id);
      if (idx !== -1) state.list[idx] = { ...state.list[idx], ...changes };
    },
    removeStaff(state, action) {
      state.list = state.list.filter(s => s.id !== action.payload);
    },
  },
});

export const { setList, addStaff, updateStaff, removeStaff } = staffSlice.actions;
export default staffSlice.reducer;