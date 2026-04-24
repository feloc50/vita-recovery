import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AppointmentList } from '../components/AppointmentList';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { fetchUserAppointments } from '../services/appointments';
import { Appointment } from '../types/appointment';
import { Calendar, ArrowRight } from 'lucide-react';

type TabType = 'confirmed' | 'cancelled';

export function Dashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('confirmed');

  async function loadAppointments() {
    if (!currentUser) return;

    try {
      setLoading(true);
      setError(null);
      const fetchedAppointments = await fetchUserAppointments(currentUser.uid, true);
      setAppointments(fetchedAppointments);
    } catch (error) {
      console.error('Error loading appointments:', error);
      setError('Unable to load appointments. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAppointments();
  }, [currentUser]);

  const filteredAppointments = appointments.filter(
    appointment => activeTab === 'confirmed' 
      ? appointment.status === 'confirmed'
      : appointment.status === 'cancelled'
  );

  function EmptyState() {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-sm">
        <Calendar className="mx-auto h-12 w-12 text-primary-500" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          {activeTab === 'confirmed' 
            ? 'No upcoming appointments'
            : 'No cancelled appointments'}
        </h3>
        {activeTab === 'confirmed' && (
          <>
            <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
              Start your journey to recovery today by booking your first appointment with one of our expert therapists.
            </p>
            <button
              onClick={() => navigate('/book')}
              className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Book Your First Session
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">My Appointments</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your upcoming therapy sessions
          </p>
        </div>
        <button
          onClick={() => navigate('/book')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Book Appointment
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('confirmed')}
              className={`
                w-1/2 py-4 px-1 text-center border-b-2 text-sm font-medium
                ${activeTab === 'confirmed'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
                transition-colors duration-200
              `}
            >
              Confirmed Appointments
            </button>
            <button
              onClick={() => setActiveTab('cancelled')}
              className={`
                w-1/2 py-4 px-1 text-center border-b-2 text-sm font-medium
                ${activeTab === 'cancelled'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
                transition-colors duration-200
              `}
            >
              Cancelled Appointments
            </button>
          </nav>
        </div>

        <div className="p-4">
          {error && <ErrorState message={error} />}

          {loading ? (
            <LoadingState />
          ) : filteredAppointments.length === 0 ? (
            <EmptyState />
          ) : (
            <AppointmentList 
              appointments={filteredAppointments}
              onAppointmentCancelled={loadAppointments}
              showCancelButton={activeTab === 'confirmed'}
            />
          )}
        </div>
      </div>
    </div>
  );
}