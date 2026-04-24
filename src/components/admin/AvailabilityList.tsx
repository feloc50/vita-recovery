import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { Clock, Calendar, Trash2 } from 'lucide-react';
import { AvailabilityBlock, WeekDay } from '../../types/availability';
import { getProfessionalAvailabilityBlocks, deleteAvailabilityBlock } from '../../services/availability';

interface AvailabilityListProps {
  professionalId: string;
  onDelete: () => void;
}

const WEEKDAY_NAMES: Record<WeekDay, string> = {
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday'
};

export function AvailabilityList({ professionalId, onDelete }: AvailabilityListProps) {
  const [blocks, setBlocks] = useState<AvailabilityBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadBlocks();
  }, [professionalId]);

  async function loadBlocks() {
    try {
      setLoading(true);
      setError(null);
      const data = await getProfessionalAvailabilityBlocks(professionalId);
      setBlocks(data);
    } catch (error) {
      console.error('Error loading availability blocks:', error);
      setError('Failed to load availability blocks');
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (blockId: string) => {
    try {
      setDeletingId(blockId);
      await deleteAvailabilityBlock(blockId);
      onDelete();
    } catch (error) {
      console.error('Error deleting block:', error);
      setError('Failed to delete availability block');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (date: any) => {
    try {
      // Handle Timestamp objects
      if (date?.toDate) {
        return format(date.toDate(), 'MMM d, yyyy');
      }
      // Handle ISO strings
      if (typeof date === 'string') {
        return format(parseISO(date), 'MMM d, yyyy');
      }
      // Handle Date objects
      if (date instanceof Date) {
        return format(date, 'MMM d, yyyy');
      }
      return 'Invalid date';
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-100 h-24 rounded-lg"></div>
        ))}
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

  if (blocks.length === 0) {
    return (
      <div className="text-center py-6 bg-gray-50 rounded-lg">
        <Clock className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No availability blocks</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by adding a new availability block.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {blocks.map((block) => {
        // Convert dates to JavaScript Date objects for proper formatting
        const startDate = block.startDate?.toDate ? block.startDate.toDate() : new Date(block.startDate);
        const endDate = block.endDate?.toDate ? block.endDate.toDate() : new Date(block.endDate);

        return (
          <div
            key={block.id}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">
                    {block.type === 'weekday' ? (
                      <>
                        Recurring on{' '}
                        {block.weekDays?.map((day) => WEEKDAY_NAMES[day]).join(', ')}
                      </>
                    ) : (
                      <>
                        {format(startDate, 'MMM d, yyyy')} - {format(endDate, 'MMM d, yyyy')}
                      </>
                    )}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {block.startTime} - {block.endTime}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleDelete(block.id)}
                disabled={deletingId === block.id}
                className="text-red-600 hover:text-red-700 disabled:opacity-50"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}