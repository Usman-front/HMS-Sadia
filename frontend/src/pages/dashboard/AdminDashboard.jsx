import { useSelector } from 'react-redux';
import Card from '../../components/Card';

export default function AdminDashboard() {
  const patients = useSelector((s) => s.patients.list);
  const doctors = useSelector((s) => s.doctors.list);
  const appointments = useSelector((s) => s.appointments.list);
  const medicines = useSelector((s) => s.pharmacy.medicines);
  const labTests = useSelector((s) => s.lab.tests);
  const invoices = useSelector((s) => s.billing.invoices);

  const cards = [
    { title: 'Patients', value: patients.length },
    { title: 'Doctors', value: doctors.length },
    { title: 'Appointments', value: appointments.length },
    { title: 'Medicines', value: medicines.length },
    { title: 'Lab Tests', value: labTests.length },
    { title: 'Invoices', value: invoices.length },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Admin Dashboard</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card key={c.title}>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">{c.title}</span>
              <span className="text-2xl font-bold">{c.value}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
