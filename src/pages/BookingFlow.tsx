import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { createAppointment } from '../services/appointments';
import { useAuth } from '../contexts/AuthContext';
import { set } from 'date-fns';
import { StepsProgress } from '../components/booking/StepsProgress';
import { LocationSelection } from '../components/booking/LocationSelection';
import { ProfessionalSelection } from '../components/booking/ProfessionalSelection';
import { DateTimeSelection } from '../components/booking/DateTimeSelection';
import { SuccessModal } from '../components/booking/SuccessModal';

const STEPS = [
  { number: 1, title: 'Location' },
  { number: 2, title: 'Professional' },
  { number: 3, title: 'Schedule' }
];

export function BookingFlow() {
  const [step, setStep] = useState(1);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  async function handleConfirmBooking() {
    if (!currentUser || !selectedDate || !selectedTime || !selectedLocation || !selectedProfessional || !selectedService) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const [hours, minutes, period] = selectedTime.match(/(\d+):(\d+)\s*(AM|PM)/)?.slice(1) || [];
      if (!hours || !minutes || !period) {
        throw new Error('Invalid time format');
      }

      let hour = parseInt(hours, 10);
      if (period === 'PM' && hour !== 12) hour += 12;
      if (period === 'AM' && hour === 12) hour = 0;

      const appointmentDate = set(selectedDate, {
        hours: hour,
        minutes: parseInt(minutes, 10),
        seconds: 0,
        milliseconds: 0
      });

      const appointmentData = {
        userId: currentUser.uid,
        locationId: selectedLocation,
        serviceId: selectedService,
        professionalId: selectedProfessional,
        date: appointmentDate.toISOString(),
        time: selectedTime,
        status: 'confirmed' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await createAppointment(appointmentData);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error creating booking:', error);
      setError('Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleNext() {
    if (step < 3) {
      if (step === 1 && !selectedLocation) {
        setError('Please select a location');
        return;
      }
      if (step === 2 && (!selectedProfessional || !selectedService)) {
        setError('Please select both a professional and a service');
        return;
      }
      setError(null);
      setStep(step + 1);
      if (step === 2) {
        setSelectedTime(null);
      }
    } else {
      handleConfirmBooking();
    }
  }

  function handleBack() {
    if (step > 1) {
      setStep(step - 1);
      setError(null);
      
      // Reset date and time when going back to professional selection
      if (step === 3) {
        setSelectedDate(null);
        setSelectedTime(null);
      }
      // Reset professional and service when going back to location selection
      if (step === 2) {
        setSelectedProfessional(null);
        setSelectedService(null);
      }
    }
  }

  function handleCloseSuccessModal() {
    setShowSuccessModal(false);
    navigate('/');
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <StepsProgress currentStep={step} steps={STEPS} />

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          {step === 1 && (
            <LocationSelection
              selectedLocation={selectedLocation}
              onLocationSelect={setSelectedLocation}
            />
          )}

          {step === 2 && (
            <ProfessionalSelection
              selectedProfessional={selectedProfessional}
              onProfessionalSelect={(professionalId, serviceId) => {
                setSelectedProfessional(professionalId);
                setSelectedService(serviceId);
              }}
            />
          )}

          {step === 3 && (
            <DateTimeSelection
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              selectedProfessionalId={selectedProfessional!}
              onDateSelect={(date) => {
                setSelectedDate(date);
                setSelectedTime(null);
              }}
              onTimeSelect={setSelectedTime}
            />
          )}

          <div className="mt-8 flex items-center justify-between">
            {step > 1 ? (
              <button
                onClick={handleBack}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </button>
            ) : (
              <div />
            )}
            <button
              onClick={handleNext}
              disabled={
                isSubmitting ||
                (step === 1 && !selectedLocation) ||
                (step === 2 && (!selectedProfessional || !selectedService)) ||
                (step === 3 && (!selectedDate || !selectedTime))
              }
              className="px-6 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting
                ? 'Confirming...'
                : step === 3
                ? 'Confirm Booking'
                : 'Continue'}
            </button>
          </div>
        </div>

        {selectedDate && selectedTime && (
          <SuccessModal
            isOpen={showSuccessModal}
            onClose={handleCloseSuccessModal}
            bookingDetails={{
              locationId: selectedLocation!,
              professionalId: selectedProfessional!,
              date: selectedDate,
              time: selectedTime
            }}
          />
        )}
      </div>
    </div>
  );
}