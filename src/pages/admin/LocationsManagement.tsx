import { useState, useEffect } from 'react';
import { Plus, Search, Edit, CheckCircle, XCircle } from 'lucide-react';
import { Location } from '../../types/location';
import { getActiveLocations, createLocation, updateLocation } from '../../services/locations';
import { LocationForm } from '../../components/admin/LocationForm';
import { Toast } from '../../components/Toast';
import { ResponsiveTable } from '../../components/admin/ResponsiveTable';

export function LocationsManagement() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | undefined>();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'address', header: 'Address' },
    {
      key: 'isActive',
      header: 'Status',
      render: (value: boolean) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? (
            <CheckCircle className="mr-1 h-4 w-4" />
          ) : (
            <XCircle className="mr-1 h-4 w-4" />
          )}
          {value ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'id',
      header: 'Actions',
      render: (value: string) => (
        <button
          onClick={() => handleEdit(locations.find(l => l.id === value)!)}
          className="text-primary-600 hover:text-primary-900"
        >
          <Edit className="h-5 w-5" />
        </button>
      )
    }
  ];

  useEffect(() => {
    loadLocations();
  }, []);

  async function loadLocations() {
    try {
      setLoading(true);
      setError(null);
      const data = await getActiveLocations();
      setLocations(data);
    } catch (error) {
      console.error('Error loading locations:', error);
      setError('Failed to load locations');
    } finally {
      setLoading(false);
    }
  }

  const handleEdit = (location: Location) => {
    setSelectedLocation(location);
    setShowForm(true);
  };

  const handleSubmit = async (data: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (selectedLocation) {
        await updateLocation(selectedLocation.id, data);
        setToast({
          message: 'Location updated successfully',
          type: 'success'
        });
      } else {
        await createLocation(data);
        setToast({
          message: 'Location created successfully',
          type: 'success'
        });
      }
      await loadLocations();
      setShowForm(false);
      setSelectedLocation(undefined);
    } catch (error) {
      console.error('Error saving location:', error);
      throw error;
    }
  };

  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderMobileCard = (location: Location) => (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-medium text-gray-900">{location.name}</h3>
          <p className="text-sm text-gray-500 mt-1">{location.address}</p>
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          location.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {location.isActive ? (
            <CheckCircle className="mr-1 h-4 w-4" />
          ) : (
            <XCircle className="mr-1 h-4 w-4" />
          )}
          {location.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>
      <div className="border-t border-gray-200 pt-4">
        <button
          onClick={() => handleEdit(location)}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <Edit className="h-4 w-4 mr-1.5" />
          Edit Location
        </button>
      </div>
    </div>
  );

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
            <h2 className="text-2xl font-bold text-gray-900">Locations</h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage your clinic's locations
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedLocation(undefined);
              setShowForm(true);
            }}
            className="mt-4 sm:mt-0 w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Add Location
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
                placeholder="Search locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <ResponsiveTable
            columns={columns}
            data={filteredLocations}
            keyField="id"
            mobileCardRenderer={renderMobileCard}
          />
        </div>
      </div>

      {showForm && (
        <LocationForm
          location={selectedLocation}
          onSubmit={handleSubmit}
          onClose={() => {
            setShowForm(false);
            setSelectedLocation(undefined);
          }}
        />
      )}
    </>
  );
}