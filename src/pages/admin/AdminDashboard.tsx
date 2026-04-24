import { useState, useEffect } from 'react';
import {
  LayoutGrid,
  Users,
  Clock,
  TrendingUp,
  Calendar,
  MapPin,
  User,
  Trash2,
  Plus,
} from 'lucide-react';
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { getUserProfile } from '../../services/profile';
import { getServiceById } from '../../services/services';
import { locations } from '../../data';
import { getLocationById } from '../../services/locations';
import { getProfessionalByUserId } from '../../services/professionals';
import { cancelAppointment } from '../../services/appointments';
import { Toast } from '../../components/Toast';
import { useUserRole } from '../../hooks/useUserRole';
import { useNavigate } from 'react-router-dom';
import { AppointmentForm } from '../../components/admin/AppointmentForm';

interface DashboardStats {
  totalAppointments: number;
  totalProfessionals: number;
  totalServices: number;
  totalClients: number;
}

interface AppointmentWithDetails {
  id: string;
  date: Date;
  time: string;
  clientName: string;
  serviceName: string;
  locationName: string;
}

export function AdminDashboard() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalAppointments: 0,
    totalProfessionals: 0,
    totalServices: 0,
    totalClients: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState<
    AppointmentWithDetails[]
  >([]);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const { isAdmin } = useUserRole();
  const navigate = useNavigate();
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);

  async function loadStats() {
    try {
      setLoading(true);
      setError(null);

      if (isAdmin) {
        // Load full stats for admin
        const appointmentsSnapshot = await getDocs(
          collection(db, 'appointments')
        );
        const totalAppointments = appointmentsSnapshot.size;

        const professionalsQuery = query(
          collection(db, 'professionals'),
          where('status', '==', 'active')
        );
        const professionalsSnapshot = await getDocs(professionalsQuery);
        const activeProfessionals = professionalsSnapshot.size;

        const servicesQuery = query(
          collection(db, 'services'),
          where('isActive', '==', true)
        );
        const servicesSnapshot = await getDocs(servicesQuery);
        const activeServices = servicesSnapshot.size;

        // Get all user profiles
        const userProfilesSnapshot = await getDocs(
          collection(db, 'userProfiles')
        );
        const userProfiles = userProfilesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Count only users who are clients but not professionals
        const totalClients = userProfiles.filter((profile) => {
          const types = profile.types || [];
          return types.includes('client') && !types.includes('professional');
        }).length;

        setStats({
          totalAppointments,
          totalProfessionals: activeProfessionals,
          totalServices: activeServices,
          totalClients,
        });
      }

      // Get upcoming appointments
      if (currentUser) {
        const professional = await getProfessionalByUserId(currentUser.uid);

        if (professional) {
          const now = new Date();
          const appointmentsQuery = query(
            collection(db, 'appointments'),
            where('professionalId', '==', professional.id),
            where('status', '==', 'confirmed'),
            where('date', '>=', Timestamp.fromDate(now))
          );

          const appointmentsSnapshot = await getDocs(appointmentsQuery);
          const appointmentsPromises = appointmentsSnapshot.docs.map(
            async (doc) => {
              const data = doc.data();

              const clientProfile = await getUserProfile(data.userId);
              const clientName = clientProfile
                ? `${clientProfile.firstName} ${clientProfile.lastName}`
                : 'Unknown Client';

              const service = await getServiceById(data.serviceId);
              const serviceName = service?.name || 'Unknown Service';

              const location = await getLocationById(data.locationId);
              const locationName = location?.name || 'Unknown Location';

              return {
                id: doc.id,
                date: data.date.toDate(),
                time: data.time,
                clientName,
                serviceName,
                locationName,
              };
            }
          );

          const appointments = await Promise.all(appointmentsPromises);
          setUpcomingAppointments(
            appointments.sort((a, b) => a.date.getTime() - b.date.getTime())
          );
        }
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStats();
  }, [currentUser, isAdmin]);

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!currentUser) return;

    try {
      setCancellingId(appointmentId);
      await cancelAppointment(appointmentId, currentUser.uid);

      setUpcomingAppointments((prev) =>
        prev.filter((appointment) => appointment.id !== appointmentId)
      );

      setToast({
        message: 'Appointment cancelled successfully',
        type: 'success',
      });
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      setToast({
        message: 'Failed to cancel appointment',
        type: 'error',
      });
    } finally {
      setCancellingId(null);
    }
  };

  const handleAppointmentCreated = () => {
    setShowAppointmentForm(false);
    setToast({
      message: 'Appointment created successfully',
      type: 'success',
    });
    // Reload appointments
    loadStats();
  };

  const stats_cards = [
    {
      name: 'Total Appointments',
      value: loading ? '-' : stats.totalAppointments,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Active Professionals',
      value: loading ? '-' : stats.totalProfessionals,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Available Services',
      value: loading ? '-' : stats.totalServices,
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      name: 'Total Clients',
      value: loading ? '-' : stats.totalClients,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="mt-1 text-sm text-gray-500">
            {isAdmin
              ? "Overview of your clinic's performance and statistics"
              : 'Manage your appointments and availability'}
          </p>
        </div>

        {isAdmin && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {stats_cards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.name}
                  className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6"
                >
                  <dt>
                    <div className={`absolute rounded-md ${card.bgColor} p-3`}>
                      <Icon
                        className={`h-6 w-6 ${card.color}`}
                        aria-hidden="true"
                      />
                    </div>
                    <p className="ml-16 truncate text-sm font-medium text-gray-500">
                      {card.name}
                    </p>
                  </dt>
                  <dd className="ml-16 flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">
                      {loading ? (
                        <span className="animate-pulse">...</span>
                      ) : (
                        card.value
                      )}
                    </p>
                  </dd>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Upcoming Appointments
            </h3>
            {!isAdmin && (
              <button
                onClick={() => setShowAppointmentForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Appointment
              </button>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="animate-pulse bg-white rounded-lg shadow-sm p-6"
                >
                  <div className="h-5 w-2/3 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : upcomingAppointments.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No upcoming appointments
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                You don't have any appointments scheduled.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200"
                >
                  <div className="bg-primary-50 px-4 py-3 border-b border-primary-100">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-primary-900">
                        {format(appointment.date, 'EEEE, MMMM d')}
                      </p>
                      <p className="text-primary-700 font-medium">
                        {appointment.time}
                      </p>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center text-gray-600">
                      <User className="h-5 w-5 mr-2 text-gray-400" />
                      <span className="font-medium text-gray-900">
                        {appointment.clientName}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-5 w-5 mr-2 text-gray-400" />
                      <span>{appointment.serviceName}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-5 w-5 mr-2 text-gray-400" />
                      <span>{appointment.locationName}</span>
                    </div>
                    <button
                      onClick={() => handleCancelAppointment(appointment.id)}
                      disabled={cancellingId === appointment.id}
                      className="w-full mt-2 inline-flex items-center justify-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="h-4 w-4 mr-1.5" />
                      {cancellingId === appointment.id
                        ? 'Cancelling...'
                        : 'Cancel Appointment'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showAppointmentForm && (
        <AppointmentForm
          onSubmit={handleAppointmentCreated}
          onClose={() => setShowAppointmentForm(false)}
        />
      )}
    </>
  );
}
