import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { AppointmentWithColor } from '../types/calendar';
import { Professional } from '../types/professional';
import { generateProfessionalColor } from '../utils/calendarUtils';
import { startOfWeek, endOfWeek } from 'date-fns';

export async function getWeeklyAppointments(
  date: Date,
  professionals: Professional[]
): Promise<AppointmentWithColor[]> {
  try {
    const start = startOfWeek(date, { weekStartsOn: 1 });
    const end = endOfWeek(date, { weekStartsOn: 1 });

    const appointmentsRef = collection(db, 'appointments');
    const q = query(
      appointmentsRef,
      where('status', '==', 'confirmed'),
      where('date', '>=', Timestamp.fromDate(start)),
      where('date', '<=', Timestamp.fromDate(end))
    );

    const snapshot = await getDocs(q);
    const appointments: AppointmentWithColor[] = [];

    snapshot.forEach(doc => {
      const appointment = {
        id: doc.id,
        ...doc.data()
      };

      const professional = professionals.find(p => p.id === appointment.professionalId);
      if (professional) {
        const professionalIndex = professionals.indexOf(professional);
        appointments.push({
          appointment,
          professional,
          color: generateProfessionalColor(professionalIndex)
        });
      }
    });

    return appointments;
  } catch (error) {
    console.error('Error fetching weekly appointments:', error);
    throw error;
  }
}