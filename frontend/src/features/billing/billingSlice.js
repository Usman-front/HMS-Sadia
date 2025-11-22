import { createSlice, nanoid } from '@reduxjs/toolkit';

const initialState = {
  invoices: [
    { id: 'inv1', number: 'INV-20250101-0001', patientId: 'p1', items: [{ description: 'Consultation', amount: 50 }], total: 50, status: 'unpaid' },
  ],
  payments: [],
};

const billingSlice = createSlice({
  name: 'billing',
  initialState,
  reducers: {
    setList(state, action) {
      state.invoices = action.payload;
    },
    createInvoice: {
      reducer(state, action) { state.invoices.push(action.payload); },
      prepare(data) {
        const now = new Date();
        const ymd = now.toISOString().slice(0, 10).replace(/-/g, '');
        const short = nanoid().slice(0, 6).toUpperCase();
        const number = `INV-${ymd}-${short}`;
        return { payload: { id: nanoid(), number, status: 'unpaid', total: data.items.reduce((s, i) => s + i.amount, 0), ...data } };
      },
    },
    payInvoice(state, action) {
      const { invoiceId, method, amount } = action.payload;
      const invoice = state.invoices.find(i => i.id === invoiceId);
      if (invoice) { invoice.status = 'paid'; state.payments.push({ id: nanoid(), invoiceId, method, amount, date: new Date().toISOString() }); }
    },
  },
});

export const { setList, createInvoice, payInvoice } = billingSlice.actions;
export default billingSlice.reducer;