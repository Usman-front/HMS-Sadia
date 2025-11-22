import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import AdminDashboard from './AdminDashboard';
import DoctorDashboard from './DoctorDashboard';
import PatientDashboard from './PatientDashboard';
import { Roles } from '../../features/auth/authSlice';
import { setList as setPatients } from '../../features/patients/patientsSlice';
import { setList as setDoctors } from '../../features/doctors/doctorsSlice';
import { setList as setAppointments } from '../../features/appointments/appointmentsSlice';
import { setList as setMedicines } from '../../features/pharmacy/pharmacySlice';
import { setList as setLabTests } from '../../features/lab/labSlice';
import { setList as setInvoices } from '../../features/billing/billingSlice';
import { PatientsAPI, DoctorsAPI, AppointmentsAPI, MedicinesAPI, LabTestsAPI, InvoicesAPI } from '../../api/client';

export default function RoleDashboard() {
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    const hydrate = async () => {
      try {
        const [patients, doctors, appointments, medicines, labTests, invoices] = await Promise.all([
          PatientsAPI.list(),
          DoctorsAPI.list(),
          AppointmentsAPI.list(),
          MedicinesAPI.list(),
          LabTestsAPI.list(),
          InvoicesAPI.list(),
        ]);

        const normalizedDoctors = doctors.map((doc) => ({
          ...doc,
          availability: Array.isArray(doc.availability)
            ? doc.availability
            : (doc.availability ? doc.availability.split(',').map((s) => s.trim()).filter(Boolean) : []),
        }));

        dispatch(setPatients(patients));
        dispatch(setDoctors(normalizedDoctors));
        dispatch(setAppointments(appointments));
        dispatch(setMedicines(medicines));
        dispatch(setLabTests(labTests));
        dispatch(setInvoices(invoices));
      } catch (e) {
        console.warn('Failed to hydrate dashboard');
      }
    };
    hydrate();
  }, [dispatch]);
  const role = user?.role;
  if (role === Roles.ADMIN) return <AdminDashboard />;
  if (role === Roles.DOCTOR) return <DoctorDashboard />;
  if (role === Roles.PATIENT) return <PatientDashboard />;
  return <div className="p-4">No dashboard for your role.</div>;
}
