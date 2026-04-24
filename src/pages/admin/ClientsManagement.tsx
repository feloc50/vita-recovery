import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { format } from 'date-fns';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { UserProfile } from '../../services/profile';
import { ResponsiveTable } from '../../components/admin/ResponsiveTable';

interface Client extends UserProfile {
  id: string;
  email?: string;
}

export function ClientsManagement() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const columns = [
    {
      key: 'fullName',
      header: 'Full Name',
      render: (_, client: Client) => {
        if (!client?.firstName) return <div className="text-sm text-gray-500">Unknown</div>;
        return (
          <div className="text-sm font-medium text-gray-900">
            {`${client.firstName} ${client.lastName || ''}`}
          </div>
        );
      }
    },
    {
      key: 'gender',
      header: 'Gender',
      render: (value: string) => (
        <div className="text-sm text-gray-500 capitalize">
          {value || 'Not specified'}
        </div>
      )
    },
    {
      key: 'birthdate',
      header: 'Birthdate',
      render: (value: string) => (
        <div className="text-sm text-gray-500">
          {value ? format(new Date(value), 'MMM d, yyyy') : '-'}
        </div>
      )
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (value: string) => (
        <div className="text-sm text-gray-500">
          {value || '-'}
        </div>
      )
    },
    {
      key: 'email',
      header: 'Email',
      render: (value: string) => (
        <div className="text-sm text-gray-500">
          {value || '-'}
        </div>
      )
    },
    {
      key: 'updatedAt',
      header: 'Created At',
      render: (value: string) => (
        <div className="text-sm text-gray-500">
          {value ? format(new Date(value), 'MMM d, yyyy') : '-'}
        </div>
      )
    }
  ];

  useEffect(() => {
    async function loadClients() {
      try {
        setLoading(true);
        setError(null);
        
        const q = query(
          collection(db, 'userProfiles'),
          where('types', 'array-contains', 'client')
        );
        
        const querySnapshot = await getDocs(q);
        const clientsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Client));
        
        setClients(clientsData);
      } catch (error) {
        console.error('Error loading clients:', error);
        setError('Failed to load clients');
      } finally {
        setLoading(false);
      }
    }

    loadClients();
  }, []);

  const filteredClients = clients.filter(client => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      (client.firstName?.toLowerCase().includes(searchLower) || '') ||
      (client.lastName?.toLowerCase().includes(searchLower) || '') ||
      (client.phone?.includes(searchQuery) || '') ||
      (client.email?.toLowerCase().includes(searchLower) || '')
    );
  });

  const renderMobileCard = (client: Client) => (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="text-sm font-medium text-gray-900">
          {client.firstName && client.lastName 
            ? `${client.firstName} ${client.lastName}`
            : 'Unknown Client'}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          {client.email || 'No email'}
        </p>
        <p className="text-sm text-gray-500">
          {client.phone || 'No phone number'}
        </p>
      </div>
      <div className="border-t border-gray-200 pt-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500">Gender</p>
            <p className="text-sm font-medium capitalize">{client.gender || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Birthdate</p>
            <p className="text-sm font-medium">
              {client.birthdate ? format(new Date(client.birthdate), 'MMM d, yyyy') : '-'}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-gray-500">Created At</p>
            <p className="text-sm font-medium">
              {client.updatedAt ? format(new Date(client.updatedAt), 'MMM d, yyyy') : '-'}
            </p>
          </div>
        </div>
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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Clients</h2>
        <p className="mt-1 text-sm text-gray-500">
          View and manage client information
        </p>
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
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <ResponsiveTable
          columns={columns}
          data={filteredClients}
          keyField="id"
          mobileCardRenderer={renderMobileCard}
        />
      </div>
    </div>
  );
}