import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import { Roles } from './features/auth/authSlice';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import RoleDashboard from './pages/dashboard/RoleDashboard';
import Patients from './pages/Patients';
import Doctors from './pages/Doctors';
import Appointments from './pages/Appointments';
import Pharmacy from './pages/Pharmacy';
import Laboratory from './pages/Laboratory';
import Billing from './pages/Billing';
import Staff from './pages/Staff';
import Reports from './pages/Reports';

function DashboardLayout({ children }) {
  return (
    <div className="h-full flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 bg-gray-50">{children}</main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
  <Route path="/login" element={<Login />} />
  {/* Admin-only account creation */}
  <Route element={<ProtectedRoute allowedRoles={[Roles.ADMIN]} />}> 
    <Route path="/register" element={<Register />} />
  </Route>

      {/* Protected routes */}
      <Route element={<ProtectedRoute allowedRoles={[Roles.ADMIN, Roles.DOCTOR, Roles.PATIENT]} />}> 
        <Route
          path="/dashboard"
          element={
            <DashboardLayout>
              <RoleDashboard />
            </DashboardLayout>
          }
        />
      </Route>

      {/* Patients: allow Admin, Doctor, Nurse, Receptionist */}
      <Route element={<ProtectedRoute allowedRoles={[Roles.ADMIN, Roles.DOCTOR, Roles.NURSE, Roles.RECEPTIONIST]} />}> 
        <Route path="/patients" element={<DashboardLayout><Patients /></DashboardLayout>} />
      </Route>

      {/* Doctors, Staff, Reports: Admin only */}
      <Route element={<ProtectedRoute allowedRoles={[Roles.ADMIN]} />}> 
        <Route path="/doctors" element={<DashboardLayout><Doctors /></DashboardLayout>} />
        <Route path="/staff" element={<DashboardLayout><Staff /></DashboardLayout>} />
        <Route path="/reports" element={<DashboardLayout><Reports /></DashboardLayout>} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[Roles.ADMIN, Roles.DOCTOR, Roles.RECEPTIONIST, Roles.PATIENT]} />}> 
        <Route path="/appointments" element={<DashboardLayout><Appointments /></DashboardLayout>} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[Roles.ADMIN, Roles.PHARMACIST]} />}> 
        <Route path="/pharmacy" element={<DashboardLayout><Pharmacy /></DashboardLayout>} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[Roles.ADMIN, Roles.LAB, Roles.DOCTOR]} />}> 
        <Route path="/laboratory" element={<DashboardLayout><Laboratory /></DashboardLayout>} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[Roles.ADMIN, Roles.RECEPTIONIST]} />}> 
        <Route path="/billing" element={<DashboardLayout><Billing /></DashboardLayout>} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
