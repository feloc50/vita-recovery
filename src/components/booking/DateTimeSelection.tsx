import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { getBookedTimeSlots } from '../../services/availability';
import { Calendar } from './Calendar';

interface DateTimeSelectionProps {
  selectedDate: Date | null;
  selectedTime: string | null;
  selectedProfessionalId: number;
  onDateSelect: (date: Date) => void;
  onTimeSelect: (time: string) => void;
}

export function DateTimeSelection({
  selectedDate,
  selectedTime,
  selectedProfessionalId,
  onDateSelect,
  onTimeSelect,
}: DateTimeSelectionProps) {
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate business hours from 7 AM to 8 PM
  const businessHours = Array.from({ length: 14 }, (_, i) => {
    const hour = i + 7; // Start from 7 AM
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  });

  useEffect(() => {
    async function fetchAvailability() {
      if (!selectedDate || !selectedProfessionalId) return;

      try {
        setIsLoading(true);
        setError(null);
        const bookedTimes = await getBookedTimeSlots(selectedProfessionalId, selectedDate);
        const available = businessHours.filter(time => !bookedTimes.includes(time));
        setAvailableTimes(available);
      } catch (error) {
        console.error('Error fetching availability:', error);
        setError('Unable to load available time slots. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchAvailability();
  }, [selectedDate, selectedProfessionalId]);

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="w-6 h-6 text-primary-600" />
          <h2 className="text-2xl font-bold text-gray-900">Select Date</h2>
        </div>
        <Calendar
          selectedDate={selectedDate}
          onDateSelect={(date) => {
            onDateSelect(date);
            onTimeSelect('');
          }}
          minDate={new Date()}
          professionalId={selectedProfessionalId}
        />
      </div>

      {selectedDate && (
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <Clock className="w-6 h-6 text-primary-600" />
            <h2 className="text-2xl font-bold text-gray-900">Select Time</h2>
          </div>
          <p className="text-sm text-gray-600">Available from 7:00 AM to 8:00 PM</p>
          
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Loading available times...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {availableTimes.map((time) => (
                <button
                  key={time}
                  onClick={() => onTimeSelect(time)}
                  className={`
                    relative overflow-hidden rounded-xl p-4
                    hover:shadow-md transition-all duration-300
                    ${selectedTime === time
                      ? 'bg-primary-50 border-2 border-primary-500'
                      : 'bg-white border border-gray-200 hover:border-primary-200'
                    }
                  `}
                >
                  <div className="text-center font-medium">{time}</div>
                  <div className={`
                    absolute inset-0 bg-gradient-to-b from-primary-50/50 to-transparent
                    transition-opacity duration-300
                    ${selectedTime === time ? 'opacity-100' : 'opacity-0 hover:opacity-50'}
                  `} />
                </button>
              ))}
              {availableTimes.length === 0 && !isLoading && !error && (
                <div className="col-span-full text-center py-4 text-gray-500">
                  No available time slots for this date. Please select another date.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}