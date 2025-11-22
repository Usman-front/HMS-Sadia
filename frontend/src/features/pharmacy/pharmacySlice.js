import { createSlice, nanoid } from '@reduxjs/toolkit';

const initialState = {
  medicines: [
    { id: 'm1', name: 'Aspirin', stock: 120, price: 5.5 },
    { id: 'm2', name: 'Amoxicillin', stock: 60, price: 12.0 },
  ],
  prescriptions: [],
};

const pharmacySlice = createSlice({
  name: 'pharmacy',
  initialState,
  reducers: {
    setList(state, action) {
      state.medicines = action.payload;
    },
    addMedicine: {
      reducer(state, action) { state.medicines.push(action.payload); },
      prepare(data) { return { payload: { id: nanoid(), ...data } }; },
    },
    updateMedicine(state, action) {
      const { id, changes } = action.payload;
      const idx = state.medicines.findIndex(m => m.id === id);
      if (idx !== -1) state.medicines[idx] = { ...state.medicines[idx], ...changes };
    },
    removeMedicine(state, action) {
      state.medicines = state.medicines.filter(m => m.id !== action.payload);
    },
    addPrescription(state, action) {
      state.prescriptions.push(action.payload);
    },
  },
});

export const { setList, addMedicine, updateMedicine, removeMedicine, addPrescription } = pharmacySlice.actions;
export default pharmacySlice.reducer;