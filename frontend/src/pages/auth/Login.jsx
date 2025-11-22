import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginSuccess, Roles } from '../../features/auth/authSlice';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { AuthAPI } from '../../api/client';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [error, setError] = useState('');
  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { user } = await AuthAPI.login(form.email, form.password);
      dispatch(loginSuccess(user));
      // Navigate based on role; Receptionist should not go to Dashboard
      const role = user?.role;
      if (role === Roles.ADMIN || role === Roles.DOCTOR) {
        navigate('/dashboard');
      } else if (role === Roles.RECEPTIONIST) {
        navigate('/appointments');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-card w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        <form className="space-y-4" onSubmit={onSubmit}>
          {error && <div className="p-2 bg-red-100 text-red-700 rounded">{error}</div>}
          <Input label="Email" name="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Password" name="password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <Button type="submit" className="w-full">Sign In</Button>
        </form>
        {/* Registration is restricted to admins; hide public register link */}
      </div>
    </div>
  );
}