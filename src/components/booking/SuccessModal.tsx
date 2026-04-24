import { useState, useEffect } from 'react';
import { CheckCircle, Calendar, MapPin, User, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { getUserProfile } from '../../services/profile';
import { getProfessionalById } from '../../services/professionals';
import { getLocationById } from '../../services/locations';
import { Location } from '../../types/location';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingDetails: {
    locationId: string;
    professionalId: string;
    date: Date;
    time: string;
  };
}

export function SuccessModal({ isOpen, onClose, bookingDetails }: SuccessModalProps) {
  const [professionalName, setProfessionalName] = useState<string>('');
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDetails() {
      try {
        setLoading(true);
        // Load professional details
        const professional = await getProfessionalById(bookingDetails.professionalId);
        if (professional) {
          const userProfile = await getUserProfile(professional.userId);
          if (userProfile) {
            setProfessionalName(`${userProfile.firstName} ${userProfile.lastName}`);
          }
        }

        // Load location details
        const locationData = await getLocationById(bookingDetails.locationId);
        setLocation(locationData);
      } catch (error) {
        console.error('Error loading details:', error);
        setProfessionalName('Unknown Professional');
      } finally {
        setLoading(false);
      }
    }

    if (isOpen && bookingDetails.professionalId) {
      loadDetails();
    }
  }, [isOpen, bookingDetails.professionalId, bookingDetails.locationId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="relative transform overflow-hidden rounded-2xl bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
            <button
              type="button"
              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 sm:mx-0 sm:h-10 sm:w-10">
              <CheckCircle className="h-6 w-6 text-primary-600" />
            </div>
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
              <h3 className="text-2xl font-semibold leading-6 text-gray-900">
                Booking Confirmed!
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Your journey to wellness begins now. We're looking forward to helping you achieve your recovery goals.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4 rounded-lg bg-gray-50 p-4">
            <div className="flex items-center space-x-3 text-sm">
              <Calendar className="h-5 w-5 text-primary-600" />
              <span className="font-medium text-gray-900">
                {format(bookingDetails.date, 'EEEE, MMMM d, yyyy')}
              </span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <Clock className="h-5 w-5 text-primary-600" />
              <span className="font-medium text-gray-900">{bookingDetails.time}</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <MapPin className="h-5 w-5 text-primary-600" />
              <span className="font-medium text-gray-900">
                {loading ? 'Loading location...' : location?.name || 'Unknown Location'}
              </span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <User className="h-5 w-5 text-primary-600" />
              {loading ? (
                <div className="animate-pulse h-5 w-32 bg-gray-200 rounded"></div>
              ) : (
                <span className="font-medium text-gray-900">{professionalName}</span>
              )}
            </div>
          </div>

          <div className="mt-6 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
            <button
              type="button"
              className="inline-flex w-full justify-center rounded-lg bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 sm:col-start-2"
              onClick={onClose}
            >
              View My Appointments
            </button>
            <button
              type="button"
              className="mt-3 inline-flex w-full justify-center rounded-lg bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
              onClick={onClose}
            >
              Add to Calendar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}