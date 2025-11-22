import { createSlice, nanoid } from '@reduxjs/toolkit';

const initialState = {
  tests: [
    { id: 't1', name: 'CBC', status: 'pending', patientId: 'p1', doctorId: 'd1', reportUrl: '' },
  ],
};

const labSlice = createSlice({
  name: 'lab',
  initialState,
  reducers: {
    setList(state, action) {
      state.tests = action.payload || [];
    },
    requestTest: {
      reducer(state, action) { state.tests.push(action.payload); },
      prepare(data) { return { payload: { id: nanoid(), status: 'pending', reportUrl: '', ...data } }; },
    },
    updateTest(state, action) {
      const { id, changes } = action.payload;
      const idx = state.tests.findIndex(t => t.id === id);
      if (idx !== -1) state.tests[idx] = { ...state.tests[idx], ...changes };
    },
    uploadReport(state, action) {
      const { id, reportUrl } = action.payload;
      const test = state.tests.find(t => t.id === id);
      if (test) { test.reportUrl = reportUrl; test.status = 'completed'; }
    },
  },
});

export const { setList, requestTest, updateTest, uploadReport } = labSlice.actions;
export default labSlice.reducer;