import { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, User } from 'lucide-react';
import { format } from 'date-fns';
import { AppointmentWithColor } from '../../types/calendar';
import { getUserProfile } from '../../services/profile';
import { getLocationById } from '../../services/locations';
import { Location } from '../../types/location';

interface TimeSlotDetailsProps {
  slot: AppointmentWithColor;
  onClose: () => void;
}

export function TimeSlotDetails({ slot, onClose }: TimeSlotDetailsProps) {
  const [professionalName, setProfessionalName] = useState('Loading...');
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDetails() {
      try {
        setLoading(true);
        // Load professional name
        const profile = await getUserProfile(slot.professional.userId);
        if (profile) {
          setProfessionalName(`${profile.firstName} ${profile.lastName}`);
        } else {
          setProfessionalName('Unknown Professional');
        }

        // Load location details
        const locationData = await getLocationById(slot.appointment.locationId);
        setLocation(locationData);
      } catch (error) {
        console.error('Error loading details:', error);
        setProfessionalName('Unknown Professional');
      } finally {
        setLoading(false);
      }
    }

    loadDetails();
  }, [slot.professional.userId, slot.appointment.locationId]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
            <button
              onClick={onClose}
              className="rounded-md bg-white text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Close</span>
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <h3 className="text-lg font-semibold leading-6 text-gray-900">
                Appointment Details
              </h3>

              <div className="mt-4 space-y-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-900">
                    {format(slot.appointment.date.toDate(), 'MMMM d, yyyy')}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-900">{slot.appointment.time}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-900">
                    {loading ? 'Loading location...' : location?.name || 'Unknown Location'}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-400" />
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-900">
                      {professionalName}
                    </span>
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: slot.color }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}