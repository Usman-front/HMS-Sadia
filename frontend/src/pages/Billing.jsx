import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setList as setInvoices } from '../features/billing/billingSlice';
import { setList as setPatients } from '../features/patients/patientsSlice';
import Card from '../components/Card';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Button from '../components/Button';
import { InvoicesAPI, PatientsAPI } from '../api/client';

export default function Billing() {
  const invoices = useSelector((s) => s.billing.invoices);
  const patients = useSelector((s) => s.patients.list);
  const dispatch = useDispatch();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ patientId: '', description: '', amount: 0 });
  const [payOpen, setPayOpen] = useState(false);
  const [payForm, setPayForm] = useState({ invoiceId: '', method: 'cash', amount: 0 });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const columns = [
    { header: 'Invoice', accessor: 'id', cell: (v, row) => row.number || v },
    { header: 'Patient', accessor: 'patientId', cell: (v) => patients.find(p => String(p.id) === String(v))?.name || v },
    { header: 'Total (PKR)', accessor: 'total' },
    { header: 'Status', accessor: 'status' },
  ];

  const actions = [
    { label: 'Pay', className: 'btn-primary', onClick: (row) => { setError(''); setPayForm({ invoiceId: row.id, method: 'cash', amount: row.total }); setPayOpen(true); } },
  ];

  const refreshInvoices = async () => {
    try {
      const list = await InvoicesAPI.list();
      dispatch(setInvoices(list));
    } catch (e) {
      console.error('Load invoices failed:', e);
      setError(e.message || 'Failed to load invoices');
    }
  };

  const refreshPatients = async () => {
    try {
      const list = await PatientsAPI.list();
      dispatch(setPatients(list));
    } catch (e) {
      console.error('Load patients failed:', e);
    }
  };

  useEffect(() => { refreshInvoices(); refreshPatients(); }, []);

  const onCreateInvoice = async () => {
    try {
      setBusy(true);
      setError('');
      const total = Number(form.amount) || 0;
      await InvoicesAPI.create({ patientId: form.patientId, total, status: 'unpaid' });
      await refreshInvoices();
      setOpen(false);
      setForm({ patientId: '', description: '', amount: 0 });
    } catch (e) {
      console.error('Create invoice failed:', e);
      setError(e.message || 'Failed to create invoice');
      alert(e.message || 'Failed to create invoice');
    } finally {
      setBusy(false);
    }
  };

  const onPay = async () => {
    try {
      setBusy(true);
      setError('');
      const inv = invoices.find(i => i.id === payForm.invoiceId);
      if (!inv) throw new Error('Invoice not found');
      await InvoicesAPI.update(inv.id, { patientId: inv.patientId, total: inv.total, status: 'paid' });
      await refreshInvoices();
      setPayOpen(false);
      setPayForm({ invoiceId: '', method: 'cash', amount: 0 });
    } catch (e) {
      console.error('Pay invoice failed:', e);
      setError(e.message || 'Failed to pay invoice');
      alert(e.message || 'Failed to pay invoice');
    } finally {
      setBusy(false);
    }
  };

  const totalOutstanding = invoices.filter(i => i.status === 'unpaid').reduce((s, i) => s + i.total, 0);
  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Billing & Payments</h2>
        <Button onClick={() => setOpen(true)}>Create Invoice</Button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Card title="Outstanding (PKR)">
          <div className="text-3xl font-bold">PKR {totalOutstanding.toFixed(2)}</div>
        </Card>
        <Card title="Paid (PKR)">
          <div className="text-3xl font-bold">PKR {totalPaid.toFixed(2)}</div>
        </Card>
      </div>

      <Card>
        <Table columns={columns} data={invoices} actions={actions} />
      </Card>

      <Modal open={open} title={'Create Invoice'} onClose={() => setOpen(false)} actions={[{ label: busy ? 'Working...' : 'Create', onClick: onCreateInvoice }]}>
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
          <Input label="Description" name="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Input label="Amount (PKR)" name="amount" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </Modal>

      <Modal open={payOpen} title={'Pay Invoice'} onClose={() => setPayOpen(false)} actions={[{ label: busy ? 'Working...' : 'Pay', onClick: onPay }]}>
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Payment Method</label>
            <select className="input" value={payForm.method} onChange={(e) => setPayForm({ ...payForm, method: e.target.value })}>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="bank">Bank Transfer</option>
            </select>
          </div>
          <Input label="Amount (PKR)" name="payAmount" type="number" value={payForm.amount} onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })} />
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </Modal>
    </div>
  );
}