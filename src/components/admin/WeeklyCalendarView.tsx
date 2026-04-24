import { useState, useEffect } from 'react';
import { format, addWeeks, subWeeks } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getBusinessHours, getWeekDays, generateProfessionalColor } from '../../utils/calendarUtils';
import { AppointmentWithColor, WeekDay } from '../../types/calendar';
import { Professional } from '../../types/professional';
import { getActiveProfessionals } from '../../services/professionals';
import { getWeeklyAppointments } from '../../services/calendar';
import { getUserProfile } from '../../services/profile';
import { LoadingState } from '../LoadingState';
import { TimeSlot } from './TimeSlot';
import { TimeSlotDetails } from './TimeSlotDetails';

interface ProfessionalWithName extends Professional {
  fullName: string;
}

export function WeeklyCalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [professionals, setProfessionals] = useState<ProfessionalWithName[]>([]);
  const [appointments, setAppointments] = useState<AppointmentWithColor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<AppointmentWithColor | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const activeProfessionals = await getActiveProfessionals();
        
        // Get full names for each professional
        const professionalsWithNames = await Promise.all(
          activeProfessionals.map(async (professional) => {
            const profile = await getUserProfile(professional.userId);
            return {
              ...professional,
              fullName: profile ? `${profile.firstName} ${profile.lastName}` : 'Unknown Professional'
            };
          })
        );
        
        setProfessionals(professionalsWithNames);
        
        const weeklyAppointments = await getWeeklyAppointments(currentDate, activeProfessionals);
        setAppointments(weeklyAppointments);
      } catch (error) {
        console.error('Error loading calendar data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [currentDate]);

  const weekDays = getWeekDays(currentDate);
  const businessHours = getBusinessHours();

  const handlePreviousWeek = () => {
    setCurrentDate(prev => subWeeks(prev, 1));
  };

  const handleNextWeek = () => {
    setCurrentDate(prev => addWeeks(prev, 1));
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Weekly Schedule</h3>
        <div className="flex items-center space-x-4">
          <button
            onClick={handlePreviousWeek}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <span className="text-sm font-medium text-gray-900">
            {format(currentDate, 'MMMM yyyy')}
          </span>
          <button
            onClick={handleNextWeek}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-6 border-b">
          <div className="py-2 px-4 text-sm font-medium text-gray-500 border-r">
            Time
          </div>
          {weekDays.map((day) => (
            <div
              key={day.date.toISOString()}
              className="py-2 px-4 text-center border-r last:border-r-0"
            >
              <div className="text-sm font-medium text-gray-900">{day.dayName}</div>
              <div className="text-sm text-gray-500">{day.dayNumber}</div>
            </div>
          ))}
        </div>

        {/* Time Slots */}
        <div className="divide-y">
          {businessHours.map((time) => (
            <div key={time} className="grid grid-cols-6">
              <div className="py-2 px-4 text-sm text-gray-500 border-r">
                {time}
              </div>
              {weekDays.map((day) => (
                <div key={day.date.toISOString()} className="p-1 border-r last:border-r-0">
                  <TimeSlot
                    date={day.date}
                    time={time}
                    appointments={appointments}
                    onSlotClick={setSelectedSlot}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Professional Legend */}
      <div className="bg-white rounded-lg shadow p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Professionals</h4>
        <div className="flex flex-wrap gap-4">
          {professionals.map((professional, index) => (
            <div
              key={professional.id}
              className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-md"
            >
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: generateProfessionalColor(index) }}
              />
              <span className="text-sm text-gray-700">
                {professional.fullName}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Time Slot Details Modal */}
      {selectedSlot && (
        <TimeSlotDetails
          slot={selectedSlot}
          onClose={() => setSelectedSlot(null)}
        />
      )}
    </div>
  );
}