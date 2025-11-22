import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import patientsReducer from '../features/patients/patientsSlice';
import doctorsReducer from '../features/doctors/doctorsSlice';
import appointmentsReducer from '../features/appointments/appointmentsSlice';
import pharmacyReducer from '../features/pharmacy/pharmacySlice';
import labReducer from '../features/lab/labSlice';
import billingReducer from '../features/billing/billingSlice';
import staffReducer from '../features/staff/staffSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    patients: patientsReducer,
    doctors: doctorsReducer,
    appointments: appointmentsReducer,
    pharmacy: pharmacyReducer,
    lab: labReducer,
    billing: billingReducer,
    staff: staffReducer,
  },
});

export default store;