import { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { Location } from '../../types/location';
import { getActiveLocations } from '../../services/locations';
import { LoadingState } from '../LoadingState';

interface LocationSelectionProps {
  selectedLocation: string | null;
  onLocationSelect: (id: string) => void;
}

export function LocationSelection({ selectedLocation, onLocationSelect }: LocationSelectionProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadLocations() {
      try {
        setLoading(true);
        setError(null);
        const activeLocations = await getActiveLocations();
        setLocations(activeLocations);
      } catch (error) {
        console.error('Error loading locations:', error);
        setError('Failed to load locations');
      } finally {
        setLoading(false);
      }
    }

    loadLocations();
  }, []);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  if (locations.length === 0) {
    return (
      <div className="text-center py-12">
        <MapPin className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No locations available</h3>
        <p className="mt-1 text-sm text-gray-500">Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <MapPin className="w-6 h-6 text-primary-600" />
        <h2 className="text-2xl font-bold text-gray-900">Select Location</h2>
      </div>
      <div className="max-w-md mx-auto space-y-2">
        {locations.map((location) => (
          <button
            key={location.id}
            onClick={() => onLocationSelect(location.id)}
            className={`w-full group relative overflow-hidden rounded-xl p-6 hover:shadow-lg transition-all duration-300 ${
              selectedLocation === location.id
                ? 'bg-primary-50 border-2 border-primary-500'
                : 'bg-white border border-gray-200 hover:border-primary-200'
            }`}
          >
            <div className="relative z-10 text-center">
              <h3 className="font-semibold text-lg text-gray-900 mb-1">
                {location.name}
              </h3>
              <p className="text-gray-600">{location.address}</p>
            </div>
            <div className={`absolute inset-0 bg-gradient-to-r from-primary-50/50 to-transparent transition-opacity duration-300 ${
              selectedLocation === location.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
            }`} />
          </button>
        ))}
      </div>
    </div>
  );
}