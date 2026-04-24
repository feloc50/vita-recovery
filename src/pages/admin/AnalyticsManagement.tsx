import { useState, useEffect } from 'react';
import { LayoutGrid, Users, Clock, TrendingUp } from 'lucide-react';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { startOfDay, endOfDay, eachDayOfInterval, format, subDays, parseISO } from 'date-fns';
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';
import { getUserProfile } from '../../services/profile';
import { getServiceById } from '../../services/services';
import { locations } from '../../data';
import { getProfessionalByUserId } from '../../services/professionals';

interface AnalyticsData {
  appointmentsPerDay: { date: string; count: number }[];
  topProfessionals: { name: string; appointments: number }[];
  topServices: { name: string; bookings: number }[];
  conversionRate: number;
}

interface GenderDistribution {
  name: string;
  value: number;
  color: string;
}

const GENDER_COLORS = {
  male: '#3B82F6',
  female: '#EC4899',
  other: '#6366F1'
};

export function AnalyticsManagement() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AnalyticsData>({
    appointmentsPerDay: [],
    topProfessionals: [],
    topServices: [],
    conversionRate: 0
  });
  const [genderDistribution, setGenderDistribution] = useState<GenderDistribution[]>([]);
  const [appointmentsTimeline, setAppointmentsTimeline] = useState<{ date: string; appointments: number }[]>([]);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        setError(null);

        // Fetch gender distribution
        const clientsRef = collection(db, 'userProfiles');
        const clientsQuery = query(
          clientsRef,
          where('types', 'array-contains', 'client')
        );
        const clientsSnapshot = await getDocs(clientsQuery);

        const genderCounts = {
          male: 0,
          female: 0,
          other: 0
        };

        clientsSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.gender) {
            genderCounts[data.gender as keyof typeof genderCounts]++;
          }
        });

        const distribution: GenderDistribution[] = Object.entries(genderCounts).map(([gender, count]) => ({
          name: gender.charAt(0).toUpperCase() + gender.slice(1),
          value: count,
          color: GENDER_COLORS[gender as keyof typeof GENDER_COLORS]
        }));

        setGenderDistribution(distribution);

        // Fetch appointments for the last 7 days
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const endDate = endOfDay(new Date());
        const startDate = startOfDay(subDays(endDate, 6));
        
        const appointmentsRef = collection(db, 'appointments');
        const appointmentsQuery = query(
          appointmentsRef,
          where('date', '>=', Timestamp.fromDate(zonedTimeToUtc(startDate, timezone))),
          where('date', '<=', Timestamp.fromDate(zonedTimeToUtc(endDate, timezone)))
        );
        
        const appointmentsSnapshot = await getDocs(appointmentsQuery);
        
        // Create an array of all days in the range
        const daysInRange = eachDayOfInterval({ start: startDate, end: endDate });
        
        // Initialize counts for each day
        const dailyCounts = daysInRange.reduce((acc, date) => {
          acc[format(date, 'yyyy-MM-dd')] = 0;
          return acc;
        }, {} as Record<string, number>);
        
        // Count appointments per day, converting UTC timestamps to local timezone
        appointmentsSnapshot.forEach((doc) => {
          const data = doc.data();
          const localDate = utcToZonedTime(data.date.toDate(), timezone);
          const dateKey = format(localDate, 'yyyy-MM-dd');
          if (dateKey in dailyCounts) {
            dailyCounts[dateKey]++;
          }
        });
        
        // Convert to array format for the chart
        const timeline = Object.entries(dailyCounts).map(([date, count]) => ({
          date: format(parseISO(date), 'MMM dd'),
          appointments: count
        }));

        setAppointmentsTimeline(timeline);

        // Set dummy data for other analytics
        setData({
          appointmentsPerDay: [
            { date: '2024-02-01', count: 8 },
            { date: '2024-02-02', count: 12 },
            { date: '2024-02-03', count: 10 }
          ],
          topProfessionals: [
            { name: 'Dr. Sarah Johnson', appointments: 45 },
            { name: 'Dr. Michael Chen', appointments: 38 }
          ],
          topServices: [
            { name: 'Manual Therapy', bookings: 28 },
            { name: 'Physiotherapy', bookings: 22 }
          ],
          conversionRate: 75.5
        });
      } catch (error) {
        console.error('Error loading analytics:', error);
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <XCircle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    {
      name: 'Appointments Today',
      value: data.appointmentsPerDay[data.appointmentsPerDay.length - 1]?.count || 0,
      icon: LayoutGrid,
      change: '+4.75%',
      changeType: 'positive'
    },
    {
      name: 'Top Professional',
      value: data.topProfessionals[0]?.name || '-',
      icon: Users,
      subValue: `${data.topProfessionals[0]?.appointments || 0} appointments`
    },
    {
      name: 'Most Booked Service',
      value: data.topServices[0]?.name || '-',
      icon: Clock,
      subValue: `${data.topServices[0]?.bookings || 0} bookings`
    },
    {
      name: 'Booking Conversion',
      value: `${data.conversionRate}%`,
      icon: TrendingUp,
      change: '+2.1%',
      changeType: 'positive'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
        <p className="mt-1 text-sm text-gray-500">
          Track your clinic's performance metrics
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6"
            >
              <dt>
                <div className="absolute rounded-md bg-primary-50 p-3">
                  <Icon className="h-6 w-6 text-primary-600" aria-hidden="true" />
                </div>
                <p className="ml-16 truncate text-sm font-medium text-gray-500">
                  {stat.name}
                </p>
              </dt>
              <dd className="ml-16 flex items-baseline">
                <p className="text-2xl font-semibold text-gray-900">
                  {loading ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    stat.value
                  )}
                </p>
                {stat.change && (
                  <p className={`ml-2 flex items-baseline text-sm font-semibold ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </p>
                )}
                {stat.subValue && (
                  <p className="ml-2 text-sm text-gray-500">
                    {stat.subValue}
                  </p>
                )}
              </dd>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-lg bg-white shadow">
          <div className="p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Appointments Last 7 Days
            </h3>
            <div className="mt-2">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={appointmentsTimeline}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      allowDecimals={false}
                    />
                    <Tooltip />
                    <Bar
                      dataKey="appointments"
                      fill="#3B82F6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white shadow">
          <div className="p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Client Gender Distribution
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {genderDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value: string) => (
                      <span className="text-sm font-medium text-gray-700">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}