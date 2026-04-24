import { useState } from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { Appointment } from '../types/appointment';
import { useAuth } from '../contexts/AuthContext';
import { cancelAppointment } from '../services/appointments';
import { format } from 'date-fns';

interface CancelModalProps {
  appointment: Appointment | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function CancelModal({ appointment, onClose, onConfirm }: CancelModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  if (!appointment) return null;

  async function handleCancel() {
    if (!currentUser) return;

    try {
      setIsSubmitting(true);
      setError(null);
      await cancelAppointment(appointment.id, currentUser.uid);
      onConfirm();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to cancel appointment');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <h3 className="text-lg font-semibold leading-6 text-gray-900">
                Cancel Appointment
              </h3>
              
              {error && (
                <div className="mt-2 rounded-md bg-red-50 p-4">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div className="mt-4 rounded-lg bg-gray-50 p-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                    <span>{format(appointment.date.toDate(), 'MMMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="h-5 w-5 text-gray-400 mr-2" />
                    <span>{appointment.time}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                    <span>{appointment.locationId}</span>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-sm text-gray-500">
                Are you sure you want to cancel this appointment? This action cannot be undone.
              </p>
            </div>
          </div>

          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleCancel}
              className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Cancelling...' : 'Cancel Appointment'}
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
            >
              Keep Appointment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}