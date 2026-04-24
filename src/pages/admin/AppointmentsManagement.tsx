import { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { collection, query, orderBy, limit, startAfter, getDocs, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { format } from 'date-fns';
import { getUserProfile } from '../../services/profile';
import { getProfessionalById } from '../../services/professionals';
import { getLocationById } from '../../services/locations';
import { LoadingState } from '../../components/LoadingState';
import { ResponsiveTable } from '../../components/admin/ResponsiveTable';
import { AppointmentForm } from '../../components/admin/AppointmentForm';
import { Toast } from '../../components/Toast';

interface AppointmentWithDetails {
  id: string;
  clientName: string;
  professionalName: string;
  date: Date;
  time: string;
  locationName: string;
  status: 'confirmed' | 'cancelled' | 'completed';
}

const APPOINTMENTS_PER_PAGE = 10;

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'confirmed':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    case 'completed':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export function AppointmentsManagement() {
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const columns = [
    { key: 'clientName', header: 'Client' },
    { key: 'professionalName', header: 'Professional' },
    {
      key: 'date',
      header: 'Date',
      render: (value: Date) => format(value, 'MMM d, yyyy')
    },
    { key: 'time', header: 'Time' },
    { key: 'locationName', header: 'Location' },
    {
      key: 'status',
      header: 'Status',
      render: (value: string) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(value)}`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    }
  ];

  async function loadAppointments(isNextPage = false) {
    try {
      setLoading(true);
      setError(null);

      let appointmentsQuery = query(
        collection(db, 'appointments'),
        orderBy('date', 'desc'),
        limit(APPOINTMENTS_PER_PAGE)
      );

      if (isNextPage && lastVisible) {
        appointmentsQuery = query(
          collection(db, 'appointments'),
          orderBy('date', 'desc'),
          startAfter(lastVisible),
          limit(APPOINTMENTS_PER_PAGE)
        );
      }

      const snapshot = await getDocs(appointmentsQuery);
      setLastVisible(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === APPOINTMENTS_PER_PAGE);

      const appointmentsData = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const data = doc.data();
          
          // Get client details
          const clientProfile = await getUserProfile(data.userId);
          const clientName = clientProfile 
            ? `${clientProfile.firstName} ${clientProfile.lastName}`
            : 'Unknown Client';

          // Get professional details
          const professional = await getProfessionalById(data.professionalId);
          let professionalName = 'Unknown Professional';
          if (professional) {
            const professionalProfile = await getUserProfile(professional.userId);
            if (professionalProfile) {
              professionalName = `${professionalProfile.firstName} ${professionalProfile.lastName}`;
            }
          }

          // Get location details
          const location = await getLocationById(data.locationId);
          const locationName = location ? location.name : 'Unknown Location';

          return {
            id: doc.id,
            clientName,
            professionalName,
            date: data.date.toDate(),
            time: data.time,
            locationName,
            status: data.status
          };
        })
      );

      if (isNextPage) {
        setAppointments(prev => [...prev, ...appointmentsData]);
      } else {
        setAppointments(appointmentsData);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleNextPage = () => {
    setPage(prev => prev + 1);
    loadAppointments(true);
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(prev => prev - 1);
      loadAppointments();
    }
  };

  const handleAppointmentCreated = async () => {
    setShowForm(false);
    await loadAppointments();
    setToast({
      message: 'Appointment created successfully',
      type: 'success'
    });
  };

  const filteredAppointments = appointments.filter(appointment => {
    const searchLower = searchQuery.toLowerCase();
    return (
      appointment.clientName.toLowerCase().includes(searchLower) ||
      appointment.professionalName.toLowerCase().includes(searchLower) ||
      appointment.locationName.toLowerCase().includes(searchLower)
    );
  });

  const renderMobileCard = (appointment: AppointmentWithDetails) => (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-medium text-gray-900">{appointment.clientName}</h3>
          <p className="text-sm text-gray-500">{appointment.professionalName}</p>
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(appointment.status)}`}>
          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
        </span>
      </div>
      <div className="border-t border-gray-200 pt-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500">Date</p>
            <p className="text-sm font-medium">{format(appointment.date, 'MMM d, yyyy')}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Time</p>
            <p className="text-sm font-medium">{appointment.time}</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-gray-500">Location</p>
            <p className="text-sm font-medium">{appointment.locationName}</p>
          </div>
        </div>
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="space-y-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Appointments</h2>
            <p className="mt-1 text-sm text-gray-500">
              View and manage all appointments
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="mt-4 sm:mt-0 w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Create Appointment
          </button>
        </div>

        <div className="flex flex-col">
          <div className="mb-4">
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md h-12"
                placeholder="Search appointments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {loading && appointments.length === 0 ? (
            <LoadingState />
          ) : (
            <>
              <ResponsiveTable
                columns={columns}
                data={filteredAppointments}
                keyField="id"
                mobileCardRenderer={renderMobileCard}
              />

              <div className="mt-4 flex items-center justify-between">
                <button
                  onClick={handlePreviousPage}
                  disabled={page === 1}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </button>
                <span className="text-sm text-gray-700">
                  Page {page}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={!hasMore}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {showForm && (
        <AppointmentForm
          onSubmit={handleAppointmentCreated}
          onClose={() => setShowForm(false)}
        />
      )}
    </>
  );
}