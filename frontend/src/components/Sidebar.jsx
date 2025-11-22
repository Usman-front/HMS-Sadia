import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Roles } from '../features/auth/authSlice';

const links = [
  { to: '/dashboard', label: 'Dashboard', roles: [Roles.ADMIN, Roles.DOCTOR, Roles.PATIENT] },
  { to: '/register', label: 'Create Account', roles: [Roles.ADMIN] },
  { to: '/patients', label: 'Patients', roles: [Roles.ADMIN, Roles.DOCTOR, Roles.NURSE, Roles.RECEPTIONIST] },
  { to: '/doctors', label: 'Doctors', roles: [Roles.ADMIN] },
  { to: '/appointments', label: 'Appointments', roles: [Roles.ADMIN, Roles.DOCTOR, Roles.RECEPTIONIST, Roles.PATIENT] },
  { to: '/pharmacy', label: 'Pharmacy', roles: [Roles.ADMIN, Roles.PHARMACIST] },
  { to: '/laboratory', label: 'Laboratory', roles: [Roles.ADMIN, Roles.LAB, Roles.DOCTOR] },
  { to: '/billing', label: 'Billing', roles: [Roles.ADMIN, Roles.RECEPTIONIST] },
  { to: '/staff', label: 'Staff', roles: [Roles.ADMIN] },
  { to: '/reports', label: 'Reports', roles: [Roles.ADMIN] },
];

export default function Sidebar() {
  const { user } = useSelector((s) => s.auth);
  const role = user?.role;
  return (
    <aside className="bg-white border-r w-64 h-full">
      <nav className="p-3 space-y-1">
        {links
          .filter((l) => (role ? l.roles.includes(role) : false))
          .map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-sm ${
                  isActive
                    ? 'bg-purple-600 text-white font-medium'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-purple-700'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
      </nav>
    </aside>
  );
}