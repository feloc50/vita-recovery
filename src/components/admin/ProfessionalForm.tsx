import { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { Professional, CreateProfessionalData } from '../../types/professional';
import { Service } from '../../types/service';
import { createProfessionalService, getProfessionalServices } from '../../services/professionalServices';
import { getActiveServices } from '../../services/services';
import { searchUsers } from '../../services/search';
import { Autocomplete } from './Autocomplete';

interface ProfessionalFormProps {
  professional?: Professional;
  onSubmit: (data: CreateProfessionalData) => Promise<string>;
  onClose: () => void;
}

export function ProfessionalForm({ professional, onSubmit, onClose }: ProfessionalFormProps) {
  const [formData, setFormData] = useState<CreateProfessionalData>({
    userId: professional?.userId || '',
    bio: professional?.bio || '',
    yearsOfExperience: professional?.yearsOfExperience || 0,
    status: professional?.status || 'active',
    specializations: professional?.specializations || [],
    education: professional?.education || [],
    isAdmin: false // Hide admin privileges checkbox
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState('');
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);

  // Load services and professional's existing services
  useEffect(() => {
    async function loadServices() {
      try {
        // Load all active services
        const services = await getActiveServices();
        setAvailableServices(services);

        // If editing, load professional's services
        if (professional?.id) {
          const professionalServices = await getProfessionalServices(professional.id);
          const selectedServiceIds = new Set(professionalServices.map(ps => ps.serviceId));
          
          const selectedServicesList = services.filter(service => 
            selectedServiceIds.has(service.id)
          );
          
          setSelectedServices(selectedServicesList);
        }
      } catch (error) {
        console.error('Error loading services:', error);
        setError('Failed to load services');
      }
    }
    loadServices();
  }, [professional]);

  // Load user name if editing
  useEffect(() => {
    async function loadUserName() {
      if (professional?.userId) {
        try {
          const users = await searchUsers('');
          const user = users.find(u => u.id === professional.userId);
          if (user) {
            setSelectedUserName(user.name);
          }
        } catch (error) {
          console.error('Error loading user name:', error);
        }
      }
    }

    loadUserName();
  }, [professional]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.userId) {
      setError('Please select a user');
      return;
    }

    if (selectedServices.length === 0) {
      setError('Please select at least one service');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // First create/update the professional
      const professionalId = professional?.id || await onSubmit(formData);

      // Then create professional-service relationships
      await Promise.all(
        selectedServices.map(service =>
          createProfessionalService({
            professionalId,
            serviceId: service.id,
            isActive: true
          })
        )
      );

      onClose();
    } catch (error) {
      console.error('Error submitting professional:', error);
      setError('Failed to save professional');
    } finally {
      setLoading(false);
    }
  };

  const handleServiceToggle = (service: Service) => {
    setSelectedServices(prev => {
      const isSelected = prev.some(s => s.id === service.id);
      if (isSelected) {
        return prev.filter(s => s.id !== service.id);
      } else {
        return [...prev, service];
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
          <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
            <button
              type="button"
              className="rounded-md bg-white text-gray-400 hover:text-gray-500"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <h3 className="text-lg font-semibold leading-6 text-gray-900">
                {professional ? 'Edit Professional' : 'Add Professional'}
              </h3>

              {error && (
                <div className="mt-2 rounded-md bg-red-50 p-4">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-4 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {professional ? 'User' : 'Search User'}
                  </label>
                  <div className="mt-1">
                    {professional ? (
                      <div className="p-2 bg-gray-50 rounded-md">
                        <span className="text-sm text-gray-700">{selectedUserName}</span>
                      </div>
                    ) : (
                      <>
                        <Autocomplete
                          onSearch={searchUsers}
                          onSelect={(user) => {
                            setFormData(prev => ({ ...prev, userId: user.id }));
                            setSelectedUserName(user.name);
                          }}
                          placeholder="Search users by name..."
                        />
                        {selectedUserName && (
                          <p className="mt-1 text-sm text-gray-500">
                            Selected: {selectedUserName}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Services
                  </label>
                  <div className="mt-2 space-y-2">
                    {availableServices.map(service => (
                      <label key={service.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedServices.some(s => s.id === service.id)}
                          onChange={() => handleServiceToggle(service)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {service.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Bio
                  </label>
                  <textarea
                    required
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.yearsOfExperience}
                    onChange={(e) => setFormData(prev => ({ ...prev, yearsOfExperience: parseInt(e.target.value) }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Professional['status'] }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex w-full justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}