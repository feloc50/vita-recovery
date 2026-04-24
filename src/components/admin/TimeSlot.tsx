import { AppointmentWithColor } from '../../types/calendar';
import { isSameDay } from 'date-fns';

interface TimeSlotProps {
  date: Date;
  time: string;
  appointments: AppointmentWithColor[];
  onSlotClick: (appointment: AppointmentWithColor) => void;
}

export function TimeSlot({ date, time, appointments, onSlotClick }: TimeSlotProps) {
  const slotAppointments = appointments.filter(({ appointment }) => {
    return isSameDay(appointment.date.toDate(), date) && appointment.time === time;
  });

  if (slotAppointments.length === 0) {
    return <div className="h-8 rounded bg-gray-50" />;
  }

  return (
    <div className="h-8 flex gap-1">
      {slotAppointments.map((appointmentWithColor) => (
        <button
          key={appointmentWithColor.appointment.id}
          onClick={() => onSlotClick(appointmentWithColor)}
          className="flex-1 rounded hover:opacity-80 transition-opacity"
          style={{ backgroundColor: appointmentWithColor.color }}
        />
      ))}
    </div>
  );
}