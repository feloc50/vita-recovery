import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isWeekend, addWeeks, startOfDay } from 'date-fns';
import { getBookedTimeSlots } from '../../services/availability';
import { getAllBusinessHours } from '../../utils/timeUtils';

interface CalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  minDate?: Date;
  professionalId: string;
}

export function Calendar({ selectedDate, onDateSelect, minDate = new Date(), professionalId }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableDates, setAvailableDates] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  
  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    async function checkAvailability() {
      if (!professionalId) return;

      setIsLoading(true);
      const availableDatesSet = new Set<string>();
      const today = startOfDay(new Date());
      const twoWeeksFromNow = addWeeks(today, 2);

      try {
        // Get all dates in the two-week window
        const datesInRange = eachDayOfInterval({
          start: today,
          end: twoWeeksFromNow
        });

        // Check availability for each date in parallel
        const availabilityChecks = datesInRange.map(async (date) => {
          if (!isWeekend(date)) {
            const bookedTimes = await getBookedTimeSlots(professionalId, date);
            const allBusinessHours = getAllBusinessHours();
            // If there are any available slots (some times are not booked)
            if (bookedTimes.length < allBusinessHours.length) {
              return format(date, 'yyyy-MM-dd');
            }
          }
          return null;
        });

        const results = await Promise.all(availabilityChecks);
        results.forEach(dateStr => {
          if (dateStr) {
            availableDatesSet.add(dateStr);
          }
        });

        setAvailableDates(availableDatesSet);
      } catch (error) {
        console.error('Error checking availability:', error);
      } finally {
        setIsLoading(false);
      }
    }

    checkAvailability();
  }, [currentMonth, professionalId]);

  function isDateAvailable(date: Date): boolean {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const today = startOfDay(new Date());
    const twoWeeksFromNow = addWeeks(today, 2);

    return !isWeekend(date) && 
           date >= minDate && 
           date >= today &&
           date <= twoWeeksFromNow &&
           availableDates.has(formattedDate);
  }

  function getMonthGrid() {
    const firstDayOfMonth = startOfMonth(currentMonth);
    const prefixDays = new Array(firstDayOfMonth.getDay()).fill(null);
    return [...prefixDays, ...days];
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="flex items-center justify-between mb-4">
          <button
            disabled
            className="p-2 rounded-full transition-colors opacity-50 cursor-not-allowed"
          >
            <ChevronLeft className="h-5 w-5 text-gray-400" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <button
            disabled
            className="p-2 rounded-full transition-colors opacity-50 cursor-not-allowed"
          >
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div
              key={day}
              className="text-center text-sm font-medium text-gray-500 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {getMonthGrid().map((date, index) => (
            <div
              key={date ? date.toISOString() : `empty-${index}`}
              className="aspect-square flex items-center justify-center"
            >
              {date && (
                <div className="w-10 h-10 flex items-center justify-center">
                  <div className="animate-pulse w-8 h-8 bg-gray-200 rounded-full"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth(prev => subMonths(prev, 1))}
          disabled={isSameMonth(currentMonth, minDate)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>
        <h2 className="text-lg font-semibold text-gray-900">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <button
          onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div
            key={day}
            className="text-center text-sm font-medium text-gray-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {getMonthGrid().map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const isAvailable = isDateAvailable(date);
          const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;

          return (
            <button
              key={date.toISOString()}
              onClick={() => isAvailable && onDateSelect(date)}
              disabled={!isAvailable}
              className={`
                aspect-square relative p-1 w-full
                flex items-center justify-center
                text-sm rounded-full
                transition-all duration-200
                ${isAvailable ? 'hover:bg-primary-50 cursor-pointer' : 'cursor-not-allowed opacity-50'}
                ${isSelected ? 'bg-primary-100 text-primary-900 font-semibold ring-2 ring-primary-500' : ''}
                ${!isSameMonth(date, currentMonth) ? 'text-gray-400' : 'text-gray-900'}
              `}
              aria-label={format(date, 'EEEE, MMMM do, yyyy')}
              aria-selected={isSelected}
            >
              <time dateTime={format(date, 'yyyy-MM-dd')}>
                {format(date, 'd')}
              </time>
              {isAvailable && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-500" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}