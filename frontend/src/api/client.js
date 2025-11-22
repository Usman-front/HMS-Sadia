const BASE_URL = import.meta.env.VITE_API_URL || 'https://hms-backend-cob0.onrender.com';

function getToken() {
  try {
    const u = JSON.parse(localStorage.getItem('hms_user'));
    return u?.token || null;
  } catch {
    return null;
  }
}

export async function api(path, { method = 'GET', body, headers = {} } = {}) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    let err = { status: res.status, message: res.statusText };
    try { err = await res.json(); } catch {}
    throw new Error(err.error || err.message || 'Request failed');
  }
  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') ? res.json() : res.text();
}

export const AuthAPI = {
  login: (email, password) => api('/auth/login', { method: 'POST', body: { email, password } }),
  register: (name, email, password, role) => api('/auth/register', { method: 'POST', body: { name, email, password, role } }),
  me: () => api('/auth/me'),
};

export const PatientsAPI = {
  list: () => api('/patients'),
  create: (data) => api('/patients', { method: 'POST', body: data }),
  update: (id, data) => api(`/patients/${id}`, { method: 'PUT', body: data }),
  remove: (id) => api(`/patients/${id}`, { method: 'DELETE' }),
};

export const DoctorsAPI = {
  list: () => api('/doctors'),
  create: (data) => api('/doctors', { method: 'POST', body: data }),
  update: (id, data) => api(`/doctors/${id}`, { method: 'PUT', body: data }),
  remove: (id) => api(`/doctors/${id}`, { method: 'DELETE' }),
};

export const StaffAPI = {
  list: () => api('/staff'),
  create: (data) => api('/staff', { method: 'POST', body: data }),
  update: (id, data) => api(`/staff/${id}`, { method: 'PUT', body: data }),
  remove: (id) => api(`/staff/${id}`, { method: 'DELETE' }),
};

// Pharmacy / Medicines
export const MedicinesAPI = {
  list: async () => {
    const rows = await api('/medicines');
    // Normalize to client shape
    return rows.map((r) => ({ id: r.id, name: r.name, stock: Number(r.stock) || 0, price: Number(r.price) || 0 }));
  },
  create: (data) => {
    const body = {
      name: data.name,
      stock: Number(data.stock) || 0,
      price: Number(data.price) || 0,
    };
    return api('/medicines', { method: 'POST', body });
  },
  update: (id, data) => {
    const body = {
      name: data.name,
      stock: Number(data.stock) || 0,
      price: Number(data.price) || 0,
    };
    return api(`/medicines/${id}`, { method: 'PUT', body });
  },
  remove: (id) => api(`/medicines/${id}`, { method: 'DELETE' }),
};

// Billing / Invoices
export const InvoicesAPI = {
  list: async () => {
    const rows = await api('/invoices');
    return rows.map((r) => ({ id: r.id, patientId: r.patient_id ?? r.patientId, total: Number(r.total) || 0, status: r.status }));
  },
  create: (data) => {
    const body = {
      patient_id: String(data.patientId),
      total: Number(data.total) || 0,
      status: data.status || 'unpaid',
    };
    return api('/invoices', { method: 'POST', body });
  },
  update: (id, data) => {
    const body = {
      patient_id: String(data.patientId),
      total: Number(data.total) || 0,
      status: data.status,
    };
    return api(`/invoices/${id}`, { method: 'PUT', body });
  },
  remove: (id) => api(`/invoices/${id}`, { method: 'DELETE' }),
};

export const AppointmentsAPI = {
  list: async () => {
    const rows = await api('/appointments');
    // Normalize server fields to client shape
    return rows.map((r) => ({
      id: r.id,
      patientId: r.patient_id ?? r.patientId,
      doctorId: r.doctor_id ?? r.doctorId,
      date: r.date,
      time: r.time || '',
      status: r.status,
      notes: r.notes || '',
    }));
  },
  create: (data) => {
    const body = {
      patient_id: String(data.patientId),
      doctor_id: String(data.doctorId),
      date: data.date,
      time: data.time || '',
      status: data.status || 'scheduled',
      notes: data.notes || '',
    };
    return api('/appointments', { method: 'POST', body });
  },
  update: (id, data) => {
    const body = {
      patient_id: String(data.patientId),
      doctor_id: String(data.doctorId),
      date: data.date,
      time: data.time || '',
      status: data.status,
      notes: data.notes || '',
    };
    return api(`/appointments/${id}`, { method: 'PUT', body });
  },
  remove: (id) => api(`/appointments/${id}`, { method: 'DELETE' }),
};

export const LabTestsAPI = {
  list: async () => {
    const rows = await api('/lab-tests');
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      status: r.status,
      patientId: r.patient_id ?? r.patientId,
      doctorId: r.doctor_id ?? r.doctorId,
      reportUrl: r.report_url ?? r.reportUrl ?? '',
    }));
  },
  create: (data) => {
    const body = {
      name: data.name,
      status: data.status || 'pending',
      patient_id: String(data.patientId),
      doctor_id: String(data.doctorId),
      report_url: data.reportUrl || '',
    };
    return api('/lab-tests', { method: 'POST', body });
  },
  update: (id, data) => {
    const body = {
      name: data.name,
      status: data.status,
      patient_id: String(data.patientId),
      doctor_id: String(data.doctorId),
      report_url: data.reportUrl || '',
    };
    return api(`/lab-tests/${id}`, { method: 'PUT', body });
  },
  remove: (id) => api(`/lab-tests/${id}`, { method: 'DELETE' }),
};
