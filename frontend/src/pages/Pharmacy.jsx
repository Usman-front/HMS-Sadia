import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setList } from '../features/pharmacy/pharmacySlice';
import Card from '../components/Card';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Button from '../components/Button';
import { MedicinesAPI } from '../api/client';

export default function Pharmacy() {
  const medicines = useSelector((s) => s.pharmacy.medicines);
  const dispatch = useDispatch();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', stock: 0, price: 0 });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Stock', accessor: 'stock' },
    { header: 'Price ($)', accessor: 'price' },
  ];

  const actions = [
    { label: 'Edit', className: 'btn-secondary', onClick: (row) => { setEditing(row); setForm({ name: row.name, stock: row.stock, price: row.price }); setOpen(true); setError(''); } },
    { label: 'Delete', className: 'btn-danger', onClick: async (row) => {
      try {
        setBusy(true);
        setError('');
        await MedicinesAPI.remove(row.id);
        await refresh();
      } catch (e) {
        console.error('Delete medicine failed:', e);
        alert(e.message || 'Failed to delete medicine');
        setError(e.message || 'Failed to delete medicine');
      } finally {
        setBusy(false);
      }
    } },
  ];

  const refresh = async () => {
    try {
      const list = await MedicinesAPI.list();
      dispatch(setList(list));
    } catch (e) {
      console.error('Load medicines failed:', e);
      setError(e.message || 'Failed to load medicines');
    }
  };

  useEffect(() => { refresh(); }, []);

  const onSubmit = async () => {
    try {
      setBusy(true);
      setError('');
      const data = { name: form.name, stock: Number(form.stock), price: Number(form.price) };
      if (editing) {
        await MedicinesAPI.update(editing.id, data);
      } else {
        await MedicinesAPI.create(data);
      }
      await refresh();
      setOpen(false);
      setEditing(null);
      setForm({ name: '', stock: 0, price: 0 });
    } catch (e) {
      console.error('Save medicine failed:', e);
      alert(e.message || 'Failed to save medicine');
      setError(e.message || 'Failed to save medicine');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Pharmacy</h2>
        <Button onClick={() => { setOpen(true); setEditing(null); setForm({ name: '', stock: 0, price: 0 }); setError(''); }}>Add Medicine</Button>
      </div>

      <Card>
        <Table columns={columns} data={medicines} actions={actions} />
      </Card>

      <Modal open={open} title={editing ? 'Edit Medicine' : 'Add Medicine'} onClose={() => setOpen(false)} actions={[{ label: busy ? 'Working...' : (editing ? 'Update' : 'Create'), onClick: onSubmit }]}>
        <div className="space-y-3">
          <Input label="Name" name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Stock" name="stock" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
          <Input label="Price" name="price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </Modal>
    </div>
  );
}