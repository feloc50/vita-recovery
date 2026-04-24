import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getProfessionalByUserId } from '../../services/professionals';
import { createAvailabilityBlock } from '../../services/availability';
import { AvailabilityForm } from '../../components/admin/AvailabilityForm';
import { AvailabilityList } from '../../components/admin/AvailabilityList';
import { WeeklyCalendarView } from '../../components/admin/WeeklyCalendarView';
import { Toast } from '../../components/Toast';
import { useUserRole } from '../../hooks/useUserRole';

export function ProfessionalAvailability() {
  const { currentUser } = useAuth();
  const { isAdmin } = useUserRole();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [professionalId, setProfessionalId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    async function loadProfessionalId() {
      if (!currentUser) return;

      try {
        setLoading(true);
        const professional = await getProfessionalByUserId(currentUser.uid);
        if (professional) {
          setProfessionalId(professional.id);
        }
      } catch (error) {
        console.error('Error loading professional:', error);
        setError('Failed to load professional information');
      } finally {
        setLoading(false);
      }
    }

    loadProfessionalId();
  }, [currentUser]);

  const handleSubmit = async (data: any) => {
    if (!professionalId) return;

    try {
      await createAvailabilityBlock(data);
      setToast({
        message: 'Availability block created successfully',
        type: 'success'
      });
      setShowForm(false);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error creating availability block:', error);
      throw error;
    }
  };

  const handleDelete = () => {
    setToast({
      message: 'Availability block deleted successfully',
      type: 'success'
    });
    setRefreshKey(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !professionalId) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <p className="text-sm text-red-700">
          {error || 'Unable to load professional information'}
        </p>
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
            <h2 className="text-2xl font-bold text-gray-900">Availability</h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage your availability for appointments
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="mt-4 sm:mt-0 inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Add Availability
          </button>
        </div>

        {/* Availability List */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Availability Blocks
          </h3>
          <AvailabilityList
            key={refreshKey}
            professionalId={professionalId}
            onDelete={handleDelete}
          />
        </div>

        {/* Weekly Calendar View - Only shown for admin users */}
        {isAdmin && (
          <div className="bg-white shadow rounded-lg p-6">
            <WeeklyCalendarView />
          </div>
        )}
      </div>

      {showForm && (
        <AvailabilityForm
          professionalId={professionalId}
          onSubmit={handleSubmit}
          onClose={() => setShowForm(false)}
        />
      )}
    </>
  );
}