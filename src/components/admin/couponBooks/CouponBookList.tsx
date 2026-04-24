import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CouponBook } from '../../../types/couponBook';
import { getUserProfile } from '../../../services/profile';
import { getServiceById } from '../../../services/services';
import { ResponsiveTable } from '../ResponsiveTable';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface CouponBookListProps {
  couponBooks: CouponBook[];
}

export function CouponBookList({ couponBooks }: CouponBookListProps) {
  const [enrichedData, setEnrichedData] = useState<Array<CouponBook & { 
    clientName: string;
    serviceName: string;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function enrichCouponBooks() {
      try {
        const enrichedBooks = await Promise.all(
          couponBooks.map(async (book) => {
            const [clientProfile, service] = await Promise.all([
              getUserProfile(book.clientId),
              getServiceById(book.serviceId)
            ]);

            return {
              ...book,
              clientName: clientProfile ? 
                `${clientProfile.firstName} ${clientProfile.lastName}` : 
                'Unknown Client',
              serviceName: service?.name || 'Unknown Service'
            };
          })
        );

        setEnrichedData(enrichedBooks);
      } catch (error) {
        console.error('Error enriching coupon books:', error);
      } finally {
        setLoading(false);
      }
    }

    enrichCouponBooks();
  }, [couponBooks]);

  const columns = [
    { 
      key: 'clientName', 
      header: 'Client'
    },
    { 
      key: 'serviceName', 
      header: 'Service'
    },
    {
      key: 'remainingSessions',
      header: 'Sessions',
      render: (value: number, item: any) => (
        <span className="text-sm">
          {value}/{item.totalSessions}
        </span>
      )
    },
    {
      key: 'price',
      header: 'Price',
      render: (value: number) => (
        <span className="text-sm">
          ${value.toFixed(2)}
        </span>
      )
    },
    {
      key: 'expirationDate',
      header: 'Expires',
      render: (value: any) => (
        <span className="text-sm">
          {format(value.toDate(), 'MMM d, yyyy')}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (value: string) => {
        const statusConfig = {
          active: { icon: CheckCircle, className: 'text-green-600' },
          completed: { icon: XCircle, className: 'text-gray-600' },
          expired: { icon: AlertCircle, className: 'text-red-600' }
        };

        const StatusIcon = statusConfig[value as keyof typeof statusConfig].icon;
        const className = statusConfig[value as keyof typeof statusConfig].className;

        return (
          <div className="flex items-center">
            <StatusIcon className={`h-5 w-5 ${className}`} />
            <span className="ml-2 capitalize">{value}</span>
          </div>
        );
      }
    }
  ];

  const renderMobileCard = (item: any) => (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-medium text-gray-900">{item.clientName}</h3>
          <p className="text-sm text-gray-500">{item.serviceName}</p>
        </div>
        <div className={`flex items-center ${
          item.status === 'active' ? 'text-green-600' :
          item.status === 'expired' ? 'text-red-600' : 'text-gray-600'
        }`}>
          {item.status === 'active' && <CheckCircle className="h-5 w-5" />}
          {item.status === 'expired' && <AlertCircle className="h-5 w-5" />}
          {item.status === 'completed' && <XCircle className="h-5 w-5" />}
        </div>
      </div>
      <div className="border-t border-gray-200 pt-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500">Sessions</p>
            <p className="text-sm font-medium">
              {item.remainingSessions}/{item.totalSessions}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Price</p>
            <p className="text-sm font-medium">${item.price.toFixed(2)}</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-gray-500">Expires</p>
            <p className="text-sm font-medium">
              {format(item.expirationDate.toDate(), 'MMM d, yyyy')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-gray-100 rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <ResponsiveTable
      columns={columns}
      data={enrichedData}
      keyField="id"
      mobileCardRenderer={renderMobileCard}
    />
  );
}