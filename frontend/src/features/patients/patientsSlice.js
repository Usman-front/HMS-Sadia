import { createSlice, nanoid } from '@reduxjs/toolkit';

const initialState = {
  list: [
    { id: 'p1', name: 'John Doe', age: 34, gender: 'Male', contact: '555-1234', history: [], prescriptions: [] },
    { id: 'p2', name: 'Jane Smith', age: 28, gender: 'Female', contact: '555-5678', history: [], prescriptions: [] },
  ],
};

const patientsSlice = createSlice({
  name: 'patients',
  initialState,
  reducers: {
    setList(state, action) {
      state.list = action.payload;
    },
    addPatient: {
      reducer(state, action) { state.list.push(action.payload); },
      prepare(data) { return { payload: { id: nanoid(), ...data } }; },
    },
    updatePatient(state, action) {
      const { id, changes } = action.payload;
      const idx = state.list.findIndex(p => p.id === id);
      if (idx !== -1) state.list[idx] = { ...state.list[idx], ...changes };
    },
    removePatient(state, action) {
      state.list = state.list.filter(p => p.id !== action.payload);
    },
    addPrescription(state, action) {
      const { patientId, prescription } = action.payload;
      const patient = state.list.find(p => p.id === patientId);
      if (patient) patient.prescriptions.push(prescription);
    },
    addHistoryEntry(state, action) {
      const { patientId, entry } = action.payload;
      const patient = state.list.find(p => p.id === patientId);
      if (patient) patient.history.push(entry);
    },
  },
});

export const { setList, addPatient, updatePatient, removePatient, addPrescription, addHistoryEntry } = patientsSlice.actions;
export default patientsSlice.reducer;