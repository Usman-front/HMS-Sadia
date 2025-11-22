import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Card from '../components/Card';
import { setList as setPatients } from '../features/patients/patientsSlice';
import { setList as setDoctors } from '../features/doctors/doctorsSlice';
import { setList as setAppointments } from '../features/appointments/appointmentsSlice';
import { setList as setInvoices } from '../features/billing/billingSlice';
import { PatientsAPI, DoctorsAPI, AppointmentsAPI, InvoicesAPI } from '../api/client';

export default function Reports() {
  const patients = useSelector((s) => s.patients.list);
  const doctors = useSelector((s) => s.doctors.list);
  const appointments = useSelector((s) => s.appointments.list);
  const invoices = useSelector((s) => s.billing.invoices);
  const dispatch = useDispatch();

  useEffect(() => {
    const hydrate = async () => {
      try {
        const [p, d, a, i] = await Promise.all([
          PatientsAPI.list(),
          DoctorsAPI.list(),
          AppointmentsAPI.list(),
          InvoicesAPI.list(),
        ]);
        const normalizedDoctors = d.map(doc => ({
          ...doc,
          availability: Array.isArray(doc.availability)
            ? doc.availability
            : (doc.availability ? doc.availability.split(',').map(s=>s.trim()).filter(Boolean) : []),
        }));
        dispatch(setPatients(p));
        dispatch(setDoctors(normalizedDoctors));
        dispatch(setAppointments(a));
        dispatch(setInvoices(i));
      } catch (e) {
        // ignore errors; individual tabs also hydrate on visit
      }
    };
    hydrate();
  }, [dispatch]);
  const revenue = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0);

  const apptByStatus = appointments.reduce((acc, a) => { acc[a.status] = (acc[a.status] || 0) + 1; return acc; }, {});

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Reports & Analytics</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="Total Patients"><div className="text-3xl font-bold">{patients.length}</div></Card>
        <Card title="Total Doctors"><div className="text-3xl font-bold">{doctors.length}</div></Card>
        <Card title="Total Appointments"><div className="text-3xl font-bold">{appointments.length}</div></Card>
        <Card title="Revenue (PKR)"><div className="text-3xl font-bold">PKR {revenue.toFixed(2)}</div></Card>
      </div>

      <Card title="Appointments by Status">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Object.entries(apptByStatus).map(([status, count]) => (
            <div key={status} className="p-3 bg-gray-100 rounded-md">
              <div className="text-sm text-muted capitalize">{status}</div>
              <div className="text-xl font-bold">{count}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}