import { useSelector } from 'react-redux';
import Card from '../../components/Card';
import { formatTime } from '../../utils/formatters';

export default function PatientDashboard() {
  const { user } = useSelector((s) => s.auth);
  const appointments = useSelector((s) => s.appointments.list.filter(a => a.patientId === (user?.id || 'p1')));
  const prescriptions = useSelector((s) => s.patients.list.find(p => p.id === (user?.id || 'p1'))?.prescriptions || []);
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Patient Dashboard</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        <Card title="Upcoming Appointments">
          <ul className="space-y-2 text-sm">
            {appointments.map((a) => (
              <li key={a.id} className="flex justify-between">
                <span>{a.date} {formatTime(a.time)}</span>
                <span className="capitalize">{a.status}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Prescriptions">
          <ul className="space-y-2 text-sm">
            {prescriptions.map((p, idx) => (
              <li key={idx}>
                <span className="font-medium">{p.name}</span> · {p.dosage}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}