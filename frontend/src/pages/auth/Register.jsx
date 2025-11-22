import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Roles } from '../../features/auth/authSlice';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { AuthAPI } from '../../api/client';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: Roles.ADMIN });
  const managementRoles = [Roles.ADMIN, Roles.DOCTOR, Roles.RECEPTIONIST];

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await AuthAPI.register(form.name, form.email, form.password, form.role);
      setSuccess('Account created successfully.');
      setForm({ name: '', email: '', password: '', role: Roles.ADMIN });
    } catch (err) {
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-card w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Create Account</h2>
        <form className="space-y-4" onSubmit={onSubmit}>
          {error && <div className="p-2 bg-red-100 text-red-700 rounded">{error}</div>}
          {success && <div className="p-2 bg-green-100 text-green-700 rounded">{success}</div>}
          <Input label="Full Name" name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Email" name="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Password" name="password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Role</label>
            <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {managementRoles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" className="w-full">Create Account</Button>
        </form>
        <p className="mt-4 text-sm text-gray-600">
          <Link to="/dashboard" className="text-primary-700 hover:underline">Back to Dashboard</Link>
        </p>
      </div>
    </div>
  );
}