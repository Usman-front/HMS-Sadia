import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setList } from '../features/appointments/appointmentsSlice';
import { setList as setPatients } from '../features/patients/patientsSlice';
import { setList as setDoctors } from '../features/doctors/doctorsSlice';
import Card from '../components/Card';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Button from '../components/Button';
import { AppointmentsAPI, PatientsAPI, DoctorsAPI } from '../api/client';
import { Roles } from '../features/auth/authSlice';
import { formatTime } from '../utils/formatters';

export default function Appointments() {
  const appointments = useSelector((s) => s.appointments.list);
  const patients = useSelector((s) => s.patients.list);
  const doctors = useSelector((s) => s.doctors.list);
  const { user } = useSelector((s) => s.auth);
  const role = user?.role;
  const dispatch = useDispatch();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ patientId: '', doctorId: '', date: '', time: '', notes: '' });

  const columns = [
    { header: 'Patient', accessor: 'patientId', cell: (v) => patients.find(p => String(p.id) === String(v))?.name || v },
    { header: 'Doctor', accessor: 'doctorId', cell: (v) => doctors.find(d => String(d.id) === String(v))?.name || v },
    { header: 'Date', accessor: 'date' },
    { header: 'Time', accessor: 'time', cell: (v) => formatTime(v) || '—' },
    { header: 'Status', accessor: 'status' },
  ];

  const actions = [
    { label: 'Edit', className: 'btn-secondary', onClick: (row) => { setEditing(row); setForm(row); setOpen(true); } },
    { label: 'Cancel', className: 'btn-danger', onClick: async (row) => { await AppointmentsAPI.update(row.id, { ...row, status: 'cancelled' }); await refreshAppointments(); } },
  ];

  const refreshAppointments = async () => {
    const list = await AppointmentsAPI.list();
    dispatch(setList(list));
  };

  const refreshPeople = async () => {
    try {
      const [p, d] = await Promise.all([PatientsAPI.list(), DoctorsAPI.list()]);
      const normalizedDoctors = d.map(doc => ({
        ...doc,
        availability: Array.isArray(doc.availability)
          ? doc.availability
          : (doc.availability ? doc.availability.split(',').map(s=>s.trim()).filter(Boolean) : [])
      }));
      dispatch(setPatients(p));
      dispatch(setDoctors(normalizedDoctors));
    } catch {}
  };

  useEffect(() => { refreshAppointments(); refreshPeople(); }, []);

  const onSubmit = async () => {
    if (editing) {
      await AppointmentsAPI.update(editing.id, form);
    } else {
      await AppointmentsAPI.create(form);
    }
    await refreshAppointments();
    setOpen(false);
    setEditing(null);
    setForm({ patientId: '', doctorId: '', date: '', time: '', notes: '' });
  };

  const normalize = (n) => String(n || '').toLowerCase().replace(/^dr\.?\s*/,'').trim();
  const matchedDoctor = doctors.find(d => normalize(d.name) === normalize(user?.name || ''));
  const currentDoctorId = String(matchedDoctor?.id || user?.id || '');
  const visibleAppointments = role === Roles.DOCTOR
    ? appointments.filter(a => String(a.doctorId) === currentDoctorId)
    : appointments;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Appointments</h2>
        <Button onClick={() => { setOpen(true); setEditing(null); }}>Book Appointment</Button>
      </div>

      <Card>
        <Table columns={columns} data={visibleAppointments} actions={actions} />
      </Card>

      <Modal open={open} title={editing ? 'Edit Appointment' : 'Book Appointment'} onClose={() => setOpen(false)} actions={[{ label: editing ? 'Update' : 'Create', onClick: onSubmit }]}>
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Patient</label>
            <select className="input" value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })}>
              <option value="">Select Patient</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Doctor</label>
            <select className="input" value={form.doctorId} onChange={(e) => setForm({ ...form, doctorId: e.target.value })}>
              <option value="">Select Doctor</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <Input label="Date" name="date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <Input label="Time" name="time" type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
          <Input label="Notes" name="notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>
      </Modal>
    </div>
  );
}