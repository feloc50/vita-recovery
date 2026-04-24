import { useState, useEffect } from 'react';
import { Plus, Search, Edit, CheckCircle, XCircle } from 'lucide-react';
import { Service } from '../../types/service';
import { getActiveServices, createService, updateService } from '../../services/services';
import { ServiceForm } from '../../components/admin/ServiceForm';
import { Toast } from '../../components/Toast';
import { ResponsiveTable } from '../../components/admin/ResponsiveTable';

export function ServicesManagement() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | undefined>();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'description', header: 'Description' },
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
          className="text-primary-600 hover:text-primary-900"
          onClick={() => handleEdit(services.find(s => s.id === value)!)}
        >
          <Edit className="h-5 w-5" />
        </button>
      )
    }
  ];

  async function loadServices() {
    try {
      setLoading(true);
      setError(null);
      const data = await getActiveServices();
      setServices(data);
    } catch (error) {
      console.error('Error loading services:', error);
      setError('Failed to load services');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadServices();
  }, []);

  const handleEdit = (service: Service) => {
    setSelectedService(service);
    setShowForm(true);
  };

  const handleSubmit = async (data: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (selectedService) {
        await updateService(selectedService.id, data);
        setToast({
          message: 'Service updated successfully',
          type: 'success'
        });
      } else {
        await createService(data);
        setToast({
          message: 'Service created successfully',
          type: 'success'
        });
      }
      await loadServices();
      setShowForm(false);
      setSelectedService(undefined);
    } catch (error) {
      console.error('Error saving service:', error);
      throw error;
    }
  };

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderMobileCard = (service: Service) => (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-medium text-gray-900">{service.name}</h3>
          <p className="text-sm text-gray-500 mt-1">{service.description}</p>
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          service.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {service.isActive ? (
            <CheckCircle className="mr-1 h-4 w-4" />
          ) : (
            <XCircle className="mr-1 h-4 w-4" />
          )}
          {service.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>
      <div className="border-t border-gray-200 pt-4">
        <button
          onClick={() => handleEdit(service)}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <Edit className="h-4 w-4 mr-1.5" />
          Edit Service
        </button>
      </div>
    </div>
  );

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
            <h2 className="text-2xl font-bold text-gray-900">Services</h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage your clinic's available services
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedService(undefined);
              setShowForm(true);
            }}
            className="mt-4 sm:mt-0 w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Add Service
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
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <ResponsiveTable
            columns={columns}
            data={filteredServices}
            keyField="id"
            mobileCardRenderer={renderMobileCard}
          />
        </div>
      </div>

      {showForm && (
        <ServiceForm
          service={selectedService}
          onSubmit={handleSubmit}
          onClose={() => {
            setShowForm(false);
            setSelectedService(undefined);
          }}
        />
      )}
    </>
  );
}