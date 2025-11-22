import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setList } from '../features/patients/patientsSlice';
import { setList as setDoctors } from '../features/doctors/doctorsSlice';
import { setList as setAppointments } from '../features/appointments/appointmentsSlice';
import Card from '../components/Card';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Button from '../components/Button';
import { PatientsAPI, DoctorsAPI, AppointmentsAPI } from '../api/client';
import { Roles } from '../features/auth/authSlice';

export default function Patients() {
  const patients = useSelector((s) => s.patients.list);
  const doctors = useSelector((s) => s.doctors.list);
  const appointments = useSelector((s) => s.appointments.list);
  const { user } = useSelector((s) => s.auth);
  const role = user?.role;
  const dispatch = useDispatch();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', age: '', gender: 'Male', contact: '' });

  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Age', accessor: 'age' },
    { header: 'Gender', accessor: 'gender' },
    { header: 'Contact', accessor: 'contact' },
  ];

  const actions = (role === Roles.ADMIN || role === Roles.RECEPTIONIST) ? [
    { label: 'Edit', className: 'btn-secondary', onClick: (row) => { setEditing(row); setForm(row); setOpen(true); } },
    { label: 'Delete', className: 'btn-danger', onClick: async (row) => { await PatientsAPI.remove(row.id); refresh(); } },
  ] : null;

  const refresh = async () => {
    const list = await PatientsAPI.list();
    dispatch(setList(list));
  };

  useEffect(() => {
    // Ensure patients, doctors, and appointments are hydrated for filtering
    (async () => {
      try {
        const [p, d, a] = await Promise.all([
          PatientsAPI.list(),
          DoctorsAPI.list(),
          AppointmentsAPI.list(),
        ]);
        dispatch(setList(p));
        dispatch(setDoctors(d.map(doc => ({
          ...doc,
          availability: Array.isArray(doc.availability)
            ? doc.availability
            : (doc.availability ? doc.availability.split(',').map(s=>s.trim()).filter(Boolean) : [])
        }))));
        dispatch(setAppointments(a));
      } catch {}
    })();
  }, [dispatch]);

  const onSubmit = async () => {
    if (editing) {
      await PatientsAPI.update(editing.id, form);
    } else {
      await PatientsAPI.create(form);
    }
    await refresh();
    setOpen(false);
    setEditing(null);
    setForm({ name: '', age: '', gender: 'Male', contact: '' });
  };

  // Doctor-specific filtering: show only patients assigned to current doctor via appointments
  const normalize = (n) => String(n || '').toLowerCase().replace(/^dr\.?\s*/, '').trim();
  const matchedDoctor = doctors.find(d => normalize(d.name) === normalize(user?.name || ''));
  const currentDoctorId = String(matchedDoctor?.id || '');
  const assignedPatientIds = Array.from(new Set(appointments
    .filter(a => String(a.doctorId) === currentDoctorId)
    .map(a => String(a.patientId))));
  const visiblePatients = role === Roles.DOCTOR
    ? patients.filter(p => assignedPatientIds.includes(String(p.id)))
    : patients;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Patient Management</h2>
        {(role === Roles.ADMIN || role === Roles.RECEPTIONIST) && (
          <Button onClick={() => { setOpen(true); setEditing(null); }}>Add Patient</Button>
        )}
      </div>

      <Card>
        <Table columns={columns} data={visiblePatients} actions={actions} />
      </Card>

      <Modal open={open} title={editing ? 'Edit Patient' : 'Add Patient'} onClose={() => setOpen(false)} actions={[{ label: editing ? 'Update' : 'Create', onClick: onSubmit }]}>
        <div className="space-y-3">
          <Input label="Name" name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Age" name="age" type="number" value={form.age} onChange={(e) => setForm({ ...form, age: Number(e.target.value) })} />
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Gender</label>
            <select className="input" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>
          <Input label="Contact" name="contact" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
        </div>
      </Modal>
    </div>
  );
}
