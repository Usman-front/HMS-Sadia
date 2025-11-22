import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';

export default function Navbar() {
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <a href="/dashboard" className="flex items-center gap-2 font-semibold text-purple-700 hover:text-purple-800 text-3xl">
          <span>HealTrack</span>
        </a>
        <div className="flex items-center gap-4">
          {user && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">{user.name}</span> · <span className="capitalize">{user.role}</span>
            </div>
          )}
          {user && (
            <button className="btn btn-secondary" onClick={() => dispatch(logout())}>Logout</button>
          )}
        </div>
      </div>
    </header>
  );
}