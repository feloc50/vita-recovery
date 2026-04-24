import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { Professional, CreateProfessionalData } from '../../types/professional';
import { getActiveProfessionals, createProfessional, updateProfessional } from '../../services/professionals';
import { getProfessionalServices } from '../../services/professionalServices';
import { getServiceById } from '../../services/services';
import { ProfessionalForm } from '../../components/admin/ProfessionalForm';
import { ProfessionalName } from '../../components/admin/ProfessionalName';
import { Toast } from '../../components/Toast';
import { ResponsiveTable } from '../../components/admin/ResponsiveTable';

interface ProfessionalWithServices extends Professional {
  services: Array<{ id: string; name: string }>;
}

export function ProfessionalsManagement() {
  const [professionals, setProfessionals] = useState<ProfessionalWithServices[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | undefined>();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const columns = [
    {
      key: 'userId',
      header: 'Professional',
      render: (value: string) => <ProfessionalName userId={value} />
    },
    {
      key: 'services',
      header: 'Services',
      render: (services: Array<{ id: string; name: string }>) => (
        <div className="flex flex-wrap gap-2">
          {services.map((service) => (
            <span
              key={service.id}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
            >
              {service.name}
            </span>
          ))}
        </div>
      )
    },
    {
      key: 'yearsOfExperience',
      header: 'Experience',
      render: (value: number) => `${value} years`
    },
    {
      key: 'status',
      header: 'Status',
      render: (value: string) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value === 'active' ? (
            <CheckCircle className="mr-1 h-4 w-4" />
          ) : (
            <XCircle className="mr-1 h-4 w-4" />
          )}
          {value}
        </span>
      )
    },
    {
      key: 'id',
      header: 'Actions',
      render: (value: string) => (
        <div className="flex space-x-2">
          <button
            className="text-primary-600 hover:text-primary-900"
            onClick={() => handleEdit(professionals.find(p => p.id === value)!)}
          >
            <Edit className="h-5 w-5" />
          </button>
          <button className="text-red-600 hover:text-red-900">
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      )
    }
  ];

  async function loadProfessionals() {
    try {
      setLoading(true);
      setError(null);
      const data = await getActiveProfessionals();
      
      // Load services for each professional
      const professionalsWithServices = await Promise.all(
        data.map(async (professional) => {
          const professionalServices = await getProfessionalServices(professional.id);
          const services = await Promise.all(
            professionalServices.map(async (ps) => {
              const service = await getServiceById(ps.serviceId);
              return service ? {
                id: service.id,
                name: service.name
              } : null;
            })
          );

          return {
            ...professional,
            services: services.filter((s): s is { id: string; name: string } => s !== null)
          };
        })
      );

      setProfessionals(professionalsWithServices);
    } catch (error) {
      console.error('Error loading professionals:', error);
      setError('Failed to load professionals');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfessionals();
  }, []);

  const handleEdit = (professional: Professional) => {
    setSelectedProfessional(professional);
    setShowForm(true);
  };

  const handleSubmit = async (data: CreateProfessionalData) => {
    try {
      if (selectedProfessional) {
        await updateProfessional(selectedProfessional.id, data);
        setToast({
          message: 'Professional updated successfully',
          type: 'success'
        });
      } else {
        await createProfessional(data);
        setToast({
          message: 'Professional created successfully',
          type: 'success'
        });
      }
      await loadProfessionals();
      setShowForm(false);
      setSelectedProfessional(undefined);
    } catch (error) {
      console.error('Error saving professional:', error);
      throw error;
    }
  };

  const filteredProfessionals = professionals.filter(professional => {
    const searchLower = searchQuery.toLowerCase();
    return (
      professional.bio?.toLowerCase().includes(searchLower) ||
      professional.services.some(service => 
        service.name.toLowerCase().includes(searchLower)
      )
    );
  });

  const renderMobileCard = (professional: ProfessionalWithServices) => (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <ProfessionalName userId={professional.userId} />
          <div className="mt-2 flex flex-wrap gap-1">
            {professional.services.map((service) => (
              <span
                key={service.id}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
              >
                {service.name}
              </span>
            ))}
          </div>
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          professional.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {professional.status === 'active' ? (
            <CheckCircle className="mr-1 h-4 w-4" />
          ) : (
            <XCircle className="mr-1 h-4 w-4" />
          )}
          {professional.status}
        </span>
      </div>
      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {professional.yearsOfExperience} years of experience
          </span>
          <div className="flex space-x-2">
            <button
              onClick={() => handleEdit(professional)}
              className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button className="inline-flex items-center px-2 py-1 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
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
            <h2 className="text-2xl font-bold text-gray-900">Professionals</h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage your clinic's professional staff
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedProfessional(undefined);
              setShowForm(true);
            }}
            className="mt-4 sm:mt-0 w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Add Professional
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
                placeholder="Search professionals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <ResponsiveTable
            columns={columns}
            data={filteredProfessionals}
            keyField="id"
            mobileCardRenderer={renderMobileCard}
          />
        </div>
      </div>

      {showForm && (
        <ProfessionalForm
          professional={selectedProfessional}
          onSubmit={handleSubmit}
          onClose={() => {
            setShowForm(false);
            setSelectedProfessional(undefined);
          }}
        />
      )}
    </>
  );
}