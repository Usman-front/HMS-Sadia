import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setList } from '../features/staff/staffSlice';
import Card from '../components/Card';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Button from '../components/Button';
import { StaffAPI } from '../api/client';

export default function Staff() {
  const staff = useSelector((s) => s.staff.list);
  const dispatch = useDispatch();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', role: 'nurse', shift: 'Day' });

  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Role', accessor: 'role' },
    { header: 'Shift', accessor: 'shift' },
  ];

  const actions = [
    { label: 'Edit', className: 'btn-secondary', onClick: (row) => { setEditing(row); setForm(row); setOpen(true); } },
    { label: 'Delete', className: 'btn-danger', onClick: async (row) => { await StaffAPI.remove(row.id); refresh(); } },
  ];

  const refresh = async () => {
    const list = await StaffAPI.list();
    dispatch(setList(list));
  };

  useEffect(() => { refresh(); }, []);

  const onSubmit = async () => {
    if (editing) {
      await StaffAPI.update(editing.id, form);
    } else {
      await StaffAPI.create(form);
    }
    await refresh();
    setOpen(false);
    setEditing(null);
    setForm({ name: '', role: 'nurse', shift: 'Day' });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Staff Management</h2>
        <Button onClick={() => { setOpen(true); setEditing(null); }}>Add Staff</Button>
      </div>

      <Card>
        <Table columns={columns} data={staff} actions={actions} />
      </Card>

      <Modal open={open} title={editing ? 'Edit Staff' : 'Add Staff'} onClose={() => setOpen(false)} actions={[{ label: editing ? 'Update' : 'Create', onClick: onSubmit }]}>
        <div className="space-y-3">
          <Input label="Name" name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Role</label>
            <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="admin">Admin</option>
              <option value="doctor">Doctor</option>
              <option value="nurse">Nurse</option>
              <option value="receptionist">Receptionist</option>
              <option value="pharmacist">Pharmacist</option>
              <option value="lab">Lab</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Shift</label>
            <select className="input" value={form.shift} onChange={(e) => setForm({ ...form, shift: e.target.value })}>
              <option>Day</option>
              <option>Evening</option>
              <option>Night</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}