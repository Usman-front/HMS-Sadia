import { useSelector } from 'react-redux';
import Card from '../../components/Card';
import { formatTime } from '../../utils/formatters';

export default function DoctorDashboard() {
  const { user } = useSelector((s) => s.auth);
  const patients = useSelector((s) => s.patients.list);
  const doctors = useSelector((s) => s.doctors.list);
  const normalize = (n) => String(n || '').toLowerCase().replace(/^dr\.?\s*/,'').trim();
  const matchedDoctor = doctors.find(d => normalize(d.name) === normalize(user?.name));
  const doctorId = String(matchedDoctor?.id || user?.id || 'd1');
  const appointments = useSelector((s) => s.appointments.list.filter(a => String(a.doctorId) === doctorId));
  const assignedPatientIds = Array.from(new Set(appointments.map(a => String(a.patientId))));
  const assignedPatientsCount = useSelector((s) => s.patients.list.filter(p => assignedPatientIds.includes(String(p.id))).length);
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Doctor Dashboard</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card title="Upcoming Appointments">
          <ul className="space-y-2">
            {appointments.map((a) => (
              <li key={a.id} className="flex justify-between text-sm">
                <span>{a.date} {formatTime(a.time)}</span>
                <span className="font-medium">{patients.find(p => p.id === a.patientId)?.name}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Patients">
          <div className="text-3xl font-bold">{assignedPatientsCount}</div>
        </Card>
      </div>
    </div>
  );
}