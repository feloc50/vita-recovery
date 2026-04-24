import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { CreateCouponBookData } from '../../../types/couponBook';
import { Timestamp } from 'firebase/firestore';
import { Autocomplete } from '../Autocomplete';
import { searchClients } from '../../../services/search';
import { getActiveServices } from '../../../services/services';
import { Service } from '../../../types/service';

interface CouponBookFormProps {
  onSubmit: (data: Omit<CreateCouponBookData, 'remainingSessions'>) => Promise<void>;
  onClose: () => void;
}

export function CouponBookForm({ onSubmit, onClose }: CouponBookFormProps) {
  const [formData, setFormData] = useState({
    clientId: '',
    serviceId: '',
    totalSessions: 5,
    price: 0,
    expirationDate: Timestamp.fromDate(addDays(new Date(), 30))
  });
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedClientName, setSelectedClientName] = useState('');

  useEffect(() => {
    async function loadServices() {
      try {
        const activeServices = await getActiveServices();
        setServices(activeServices);
      } catch (error) {
        console.error('Error loading services:', error);
        setError('Failed to load services');
      }
    }

    loadServices();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.clientId || !formData.serviceId) {
      setError('Please select both a client and a service');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSubmit(formData);
    } catch (error) {
      console.error('Error creating coupon book:', error);
      setError('Failed to create coupon book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
            <button
              onClick={onClose}
              className="rounded-md bg-white text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Close</span>
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <h3 className="text-lg font-semibold leading-6 text-gray-900">
                Create Coupon Book
              </h3>

              {error && (
                <div className="mt-2 rounded-md bg-red-50 p-4">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Client
                  </label>
                  <div className="mt-1">
                    <Autocomplete
                      onSearch={searchClients}
                      onSelect={(client) => {
                        setFormData(prev => ({ ...prev, clientId: client.id }));
                        setSelectedClientName(client.name);
                      }}
                      placeholder="Search clients..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Service
                  </label>
                  <select
                    value={formData.serviceId}
                    onChange={(e) => setFormData(prev => ({ ...prev, serviceId: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  >
                    <option value="">Select service</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Number of Sessions
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.totalSessions}
                    onChange={(e) => setFormData(prev => ({ ...prev, totalSessions: parseInt(e.target.value) }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Price
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                      className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Expiration Date
                  </label>
                  <input
                    type="date"
                    min={format(new Date(), 'yyyy-MM-dd')}
                    value={format(formData.expirationDate.toDate(), 'yyyy-MM-dd')}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      expirationDate: Timestamp.fromDate(new Date(e.target.value))
                    }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </div>

                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex w-full justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating...' : 'Create Coupon Book'}
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