import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import { locations } from '../../data';
import { Autocomplete } from './Autocomplete';
import { searchClients, searchProfessionals } from '../../services/search';
import { createAppointment } from '../../services/appointments';
import { getBookedTimeSlots } from '../../services/availability';
import { useUserRole } from '../../hooks/useUserRole';
import { getProfessionalByUserId } from '../../services/professionals';
import { useAuth } from '../../contexts/AuthContext';

interface AppointmentFormProps {
  onSubmit: () => void;
  onClose: () => void;
}

interface FormData {
  clientId: string;
  professionalId: string;
  locationId: string;
  date: string;
  time: string;
}

export function AppointmentForm({ onSubmit, onClose }: AppointmentFormProps) {
  const { currentUser } = useAuth();
  const { isAdmin } = useUserRole();
  const [formData, setFormData] = useState<FormData>({
    clientId: '',
    professionalId: '',
    locationId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);

  // Generate business hours from 7 AM to 8 PM
  const businessHours = Array.from({ length: 14 }, (_, i) => {
    const hour = i + 7;
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  });

  // Load professional ID for non-admin users
  useEffect(() => {
    async function loadProfessionalId() {
      if (!currentUser || isAdmin) return;

      try {
        const professional = await getProfessionalByUserId(currentUser.uid);
        if (professional) {
          setFormData(prev => ({ ...prev, professionalId: professional.id }));
        }
      } catch (error) {
        console.error('Error loading professional:', error);
        setError('Failed to load professional information');
      }
    }

    loadProfessionalId();
  }, [currentUser, isAdmin]);

  useEffect(() => {
    async function fetchAvailableTimes() {
      if (!formData.professionalId || !formData.date) {
        setAvailableTimes([]);
        return;
      }

      try {
        setLoadingTimes(true);
        const bookedTimes = await getBookedTimeSlots(formData.professionalId, new Date(formData.date));
        const available = businessHours.filter(time => !bookedTimes.includes(time));
        setAvailableTimes(available);
      } catch (error) {
        console.error('Error fetching available times:', error);
        setError('Failed to load available time slots');
      } finally {
        setLoadingTimes(false);
      }
    }

    fetchAvailableTimes();
  }, [formData.professionalId, formData.date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.clientId || !formData.professionalId || !formData.locationId || !formData.date || !formData.time) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await createAppointment({
        userId: formData.clientId,
        professionalId: formData.professionalId,
        locationId: formData.locationId,
        date: new Date(formData.date).toISOString(),
        time: formData.time,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      onSubmit();
    } catch (error) {
      console.error('Error creating appointment:', error);
      setError('Failed to create appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
            <button
              type="button"
              className="rounded-md bg-white text-gray-400 hover:text-gray-500"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <h3 className="text-lg font-semibold leading-6 text-gray-900">
                Create Appointment
              </h3>

              {error && (
                <div className="mt-2 rounded-md bg-red-50 p-4">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Client
                  </label>
                  <div className="mt-1">
                    <Autocomplete
                      onSearch={searchClients}
                      onSelect={(client) => setFormData(prev => ({ ...prev, clientId: client.id }))}
                      placeholder="Search clients..."
                    />
                  </div>
                </div>

                {isAdmin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Professional
                    </label>
                    <div className="mt-1">
                      <Autocomplete
                        onSearch={searchProfessionals}
                        onSelect={(professional) => {
                          setFormData(prev => ({
                            ...prev,
                            professionalId: professional.id,
                            time: '' // Reset time when professional changes
                          }));
                        }}
                        placeholder="Search professionals..."
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Location
                  </label>
                  <select
                    value={formData.locationId}
                    onChange={(e) => setFormData(prev => ({ ...prev, locationId: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  >
                    <option value="">Select location</option>
                    {locations.map((location) => (
                      <option key={location.id} value={location.id}>
                        {location.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      date: e.target.value,
                      time: '' // Reset time when date changes
                    }))}
                    disabled={!formData.professionalId}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Time
                  </label>
                  <select
                    value={formData.time}
                    onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                    disabled={!formData.professionalId || !formData.date || loadingTimes}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {loadingTimes 
                        ? 'Loading available times...'
                        : !formData.professionalId
                        ? 'Select a professional first'
                        : !formData.date
                        ? 'Select a date first'
                        : 'Select time'
                      }
                    </option>
                    {availableTimes.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex w-full justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating...' : 'Create Appointment'}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}