import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setList as setLabTests } from '../features/lab/labSlice';
import { setList as setPatients } from '../features/patients/patientsSlice';
import { setList as setDoctors } from '../features/doctors/doctorsSlice';
import Card from '../components/Card';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Button from '../components/Button';
import { PatientsAPI, DoctorsAPI, LabTestsAPI } from '../api/client';
import { Roles } from '../features/auth/authSlice';

export default function Laboratory() {
  const tests = useSelector((s) => s.lab.tests);
  const patients = useSelector((s) => s.patients.list);
  const doctors = useSelector((s) => s.doctors.list);
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', patientId: '', doctorId: '', status: 'pending' });
  const [reportOpen, setReportOpen] = useState(false);
  const [reportForm, setReportForm] = useState({ id: '', reportUrl: '' });

  const columns = [
    { header: 'Test', accessor: 'name' },
    { header: 'Patient', accessor: 'patientId', cell: (v) => {
      const val = String(v);
      return patients.find(p => String(p.id) === val)?.name || v;
    } },
    { header: 'Doctor', accessor: 'doctorId', cell: (v) => {
      const val = String(v);
      return doctors.find(d => String(d.id) === val)?.name || v;
    } },
    { header: 'Status', accessor: 'status' },
    { header: 'Report', accessor: 'reportUrl', cell: (v) => v ? <a className="text-primary-700" href={v} target="_blank">View</a> : '—' },
  ];

  const actions = [
    { label: 'Edit', className: 'btn-secondary', onClick: (row) => { setEditing(row); setForm(row); setOpen(true); } },
    { label: 'Upload Report', className: 'btn-primary', onClick: (row) => { setReportForm({ id: row.id, reportUrl: row.reportUrl || '' }); setReportOpen(true); } },
  ];

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
    } catch (e) {
      console.warn('Failed to refresh people');
    }
  };

  const refreshTests = async () => {
    const list = await LabTestsAPI.list();
    dispatch(setLabTests(list));
  };

  useEffect(() => { refreshPeople(); refreshTests(); }, []);

  const onSubmit = async () => {
    if (editing) {
      await LabTestsAPI.update(editing.id, form);
    } else {
      await LabTestsAPI.create(form);
    }
    await refreshTests();
    setOpen(false);
    setEditing(null);
    setForm({ name: '', patientId: '', doctorId: '', status: 'pending' });
  };

  const onUpload = async () => {
    await LabTestsAPI.update(reportForm.id, { ...tests.find(t => t.id === reportForm.id), reportUrl: reportForm.reportUrl, status: 'completed' });
    await refreshTests();
    setReportOpen(false);
    setReportForm({ id: '', reportUrl: '' });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Laboratory</h2>
        <Button onClick={() => { setOpen(true); setEditing(null); }}>Request Test</Button>
      </div>

      <Card>
        <Table
          columns={columns}
          data={(user?.role === Roles.DOCTOR)
            ? tests.filter(t => {
                const normalize = (n) => String(n || '').toLowerCase().replace(/^dr\.?\s*/,'').trim();
                const matchedDoctor = doctors.find(d => normalize(d.name) === normalize(user?.name || ''));
                const currentDoctorId = String(matchedDoctor?.id || user?.id || '');
                return String(t.doctorId) === currentDoctorId;
              })
            : tests}
          actions={actions}
        />
      </Card>

      <Modal open={open} title={editing ? 'Edit Test' : 'Request Test'} onClose={() => setOpen(false)} actions={[{ label: editing ? 'Update' : 'Create', onClick: onSubmit }]}> 
        <div className="space-y-3">
          <Input label="Test Name" name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
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
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Status</label>
            <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </Modal>

      <Modal open={reportOpen} title={'Upload Report'} onClose={() => setReportOpen(false)} actions={[{ label: 'Upload', onClick: onUpload }]}>
        <div className="space-y-3">
          <Input label="Report URL" name="reportUrl" value={reportForm.reportUrl} onChange={(e) => setReportForm({ ...reportForm, reportUrl: e.target.value })} />
        </div>
      </Modal>
    </div>
  );
}
