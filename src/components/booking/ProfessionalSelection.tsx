import { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { Professional } from '../../types/professional';
import { getActiveProfessionals } from '../../services/professionals';
import { getProfessionalServices } from '../../services/professionalServices';
import { getServiceById } from '../../services/services';
import { getUserProfile } from '../../services/profile';

interface ProfessionalSelectionProps {
  selectedProfessional: string | null;
  onProfessionalSelect: (id: string, serviceId: string) => void;
}

interface ProfessionalWithDetails extends Professional {
  fullName: string;
  services: Array<{
    id: string;
    name: string;
  }>;
}

export function ProfessionalSelection({ selectedProfessional, onProfessionalSelect }: ProfessionalSelectionProps) {
  const [professionals, setProfessionals] = useState<ProfessionalWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfessionals() {
      try {
        setLoading(true);
        setError(null);
        
        const activeProfessionals = await getActiveProfessionals();
        
        const professionalDetails = await Promise.all(
          activeProfessionals.map(async (professional) => {
            const userProfile = await getUserProfile(professional.userId);
            const fullName = userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : 'Unknown Professional';
            
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
              fullName,
              services: services.filter((s): s is { id: string; name: string } => s !== null)
            };
          })
        );

        setProfessionals(professionalDetails);
      } catch (error) {
        console.error('Error loading professionals:', error);
        setError('Failed to load professionals');
      } finally {
        setLoading(false);
      }
    }

    loadProfessionals();
  }, []);

  const handleServiceSelect = (professionalId: string, serviceId: string) => {
    setSelectedService(serviceId);
    onProfessionalSelect(professionalId, serviceId);
  };

  const handleProfessionalSelect = (professionalId: string) => {
    if (professionalId !== selectedProfessional) {
      setSelectedService(null);
      onProfessionalSelect(professionalId, '');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <User className="w-6 h-6 text-primary-600" />
          <h2 className="text-2xl font-bold text-gray-900">Select Professional & Service</h2>
        </div>
        <div className="max-w-md mx-auto space-y-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-lg p-3 bg-white border border-gray-200"
            >
              <div className="h-5 w-2/3 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
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
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <User className="w-6 h-6 text-primary-600" />
        <h2 className="text-2xl font-bold text-gray-900">Select Professional & Service</h2>
      </div>
      <div className="max-w-md mx-auto space-y-2">
        {professionals.map((professional) => (
          <div
            key={professional.id}
            className={`rounded-lg ${
              selectedProfessional === professional.id
                ? 'ring-2 ring-primary-500'
                : 'border border-gray-200'
            }`}
          >
            {selectedProfessional === professional.id ? (
              <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-900 text-center">
                  {professional.fullName}
                </h3>
                <p className="text-sm text-gray-500 text-center mt-1 mb-3">Select a service:</p>
                <div className="space-y-1.5">
                  {professional.services.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => handleServiceSelect(professional.id, service.id)}
                      className={`w-full py-2 px-3 rounded-md border text-left ${
                        selectedService === service.id
                          ? 'bg-primary-50 border-primary-500'
                          : 'border-gray-200 hover:border-primary-200'
                      }`}
                    >
                      {service.name}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <button
                onClick={() => handleProfessionalSelect(professional.id)}
                className="w-full py-2.5 px-4 text-center"
              >
                <h3 className="font-semibold text-lg text-gray-900">
                  {professional.fullName}
                </h3>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}