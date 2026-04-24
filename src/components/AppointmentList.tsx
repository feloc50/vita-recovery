import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Trash2 } from 'lucide-react';
import { Appointment } from '../types/appointment';
import { CancelModal } from './CancelModal';
import { getServiceById } from '../services/services';
import { getUserProfile } from '../services/profile';
import { getProfessionalById } from '../services/professionals';
import { getLocationById } from '../services/locations';
import { format } from 'date-fns';

interface AppointmentWithDetails extends Omit<Appointment, 'date' | 'createdAt' | 'updatedAt'> {
  date: string;
  createdAt: string;
  updatedAt: string;
  serviceName: string;
  professionalName: string;
  locationName: string;
}

interface AppointmentListProps {
  appointments: Appointment[];
  onAppointmentCancelled?: () => void;
  showCancelButton?: boolean;
}

export function AppointmentList({ 
  appointments, 
  onAppointmentCancelled,
  showCancelButton = true
}: AppointmentListProps) {
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [appointmentsWithDetails, setAppointmentsWithDetails] = useState<AppointmentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAppointmentDetails() {
      try {
        setLoading(true);
        const detailedAppointments = await Promise.all(
          appointments.map(async (appointment) => {
            // Get service details
            const service = await getServiceById(appointment.serviceId);
            
            // Get professional details
            const professional = await getProfessionalById(appointment.professionalId);
            let professionalName = 'Unknown Professional';
            if (professional) {
              const userProfile = await getUserProfile(professional.userId);
              if (userProfile) {
                professionalName = `${userProfile.firstName} ${userProfile.lastName}`;
              }
            }

            // Get location details
            const location = await getLocationById(appointment.locationId);
            const locationName = location ? location.name : 'Unknown Location';

            return {
              ...appointment,
              date: appointment.date.toDate().toISOString(),
              createdAt: appointment.createdAt.toDate().toISOString(),
              updatedAt: appointment.updatedAt.toDate().toISOString(),
              serviceName: service?.name || 'Unknown Service',
              professionalName,
              locationName
            };
          })
        );

        setAppointmentsWithDetails(detailedAppointments);
      } catch (error) {
        console.error('Error loading appointment details:', error);
      } finally {
        setLoading(false);
      }
    }

    loadAppointmentDetails();
  }, [appointments]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-20 bg-gray-100 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="divide-y divide-gray-200">
        {appointmentsWithDetails.map((appointment) => (
          <div 
            key={appointment.id}
            className="py-4 first:pt-0 last:pb-0"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div className="flex flex-col">
                <p className="text-sm font-medium text-primary-600">
                  {appointment.serviceName}
                </p>
                <p className="text-sm text-gray-500">
                  {appointment.professionalName}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-6">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>{format(new Date(appointment.date), 'dd/MM/yyyy')}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>{appointment.time}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="hidden sm:inline">{appointment.locationName}</span>
                    <span className="sm:hidden">{appointment.locationName}</span>
                  </div>
                </div>
                {showCancelButton && appointment.status === 'confirmed' && (
                  <button
                    onClick={() => setSelectedAppointment(appointments.find(a => a.id === appointment.id) || null)}
                    className="inline-flex items-center px-2.5 py-1.5 border border-red-300 text-sm font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4 mr-1.5" />
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <CancelModal
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        onConfirm={() => {
          onAppointmentCancelled?.();
          setSelectedAppointment(null);
        }}
      />
    </>
  );
}