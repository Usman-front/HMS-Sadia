import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setList } from '../features/doctors/doctorsSlice';
import Card from '../components/Card';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Button from '../components/Button';
import { DoctorsAPI } from '../api/client';

export default function Doctors() {
  const doctors = useSelector((s) => s.doctors.list);
  const dispatch = useDispatch();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', specialty: '', availability: [] });

  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Specialty', accessor: 'specialty' },
    { header: 'Availability', accessor: 'availability', cell: (v) => v.join(', ') },
  ];

  const actions = [
    { label: 'Edit', className: 'btn-secondary', onClick: (row) => { setEditing(row); setForm({ ...row, availability: row.availability }); setOpen(true); } },
    { label: 'Delete', className: 'btn-danger', onClick: async (row) => { await DoctorsAPI.remove(row.id); refresh(); } },
  ];

  const refresh = async () => {
    const list = await DoctorsAPI.list();
    // availability is stored as TEXT; normalize to arrays for UI
    const normalized = list.map(d => ({ ...d, availability: Array.isArray(d.availability) ? d.availability : (d.availability ? d.availability.split(',').map(s=>s.trim()).filter(Boolean) : []) }));
    dispatch(setList(normalized));
  };

  useEffect(() => { refresh(); }, []);

  const onSubmit = async () => {
    const data = { ...form, availability: Array.isArray(form.availability) ? form.availability : form.availability.split(',').map(s => s.trim()).filter(Boolean) };
    if (editing) {
      await DoctorsAPI.update(editing.id, { ...data, availability: data.availability.join(',') });
    } else {
      await DoctorsAPI.create({ ...data, availability: data.availability.join(',') });
    }
    await refresh();
    setOpen(false);
    setEditing(null);
    setForm({ name: '', specialty: '', availability: [] });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Doctor Management</h2>
        <Button onClick={() => { setOpen(true); setEditing(null); }}>Add Doctor</Button>
      </div>

      <Card>
        <Table columns={columns} data={doctors} actions={actions} />
      </Card>

      <Modal open={open} title={editing ? 'Edit Doctor' : 'Add Doctor'} onClose={() => setOpen(false)} actions={[{ label: editing ? 'Update' : 'Create', onClick: onSubmit }]}>
        <div className="space-y-3">
          <Input label="Name" name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Specialty" name="specialty" value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} />
          <Input label="Availability (comma-separated days)" name="availability" value={Array.isArray(form.availability) ? form.availability.join(', ') : form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })} />
        </div>
      </Modal>
    </div>
  );
}