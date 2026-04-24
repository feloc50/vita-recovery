import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { AvailabilityBlock, CreateAvailabilityBlockData, RecurrenceType, WeekDay } from '../../types/availability';

interface AvailabilityFormProps {
  block?: AvailabilityBlock;
  professionalId: string;
  onSubmit: (data: CreateAvailabilityBlockData) => Promise<void>;
  onClose: () => void;
}

const WEEKDAYS: Array<{ value: WeekDay; label: string }> = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' }
];

export function AvailabilityForm({ block, professionalId, onSubmit, onClose }: AvailabilityFormProps) {
  const [formData, setFormData] = useState<CreateAvailabilityBlockData>({
    professionalId,
    type: block?.type || 'date',
    startDate: block?.startDate || format(new Date(), 'yyyy-MM-dd'),
    endDate: block?.endDate || format(new Date(), 'yyyy-MM-dd'),
    startTime: block?.startTime || '9:00 AM',
    endTime: block?.endTime || '5:00 PM',
    weekDays: block?.weekDays || []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      // Validate form data
      if (formData.type === 'weekday' && formData.weekDays?.length === 0) {
        throw new Error('Please select at least one weekday');
      }

      if (new Date(formData.endDate) < new Date(formData.startDate)) {
        throw new Error('End date cannot be before start date');
      }

      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting availability block:', error);
      setError(error instanceof Error ? error.message : 'Failed to save availability block');
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (type: RecurrenceType) => {
    setFormData(prev => ({
      ...prev,
      type,
      weekDays: type === 'weekday' ? prev.weekDays : [] // Always keep as empty array instead of undefined
    }));
  };

  const handleStartDateChange = (date: string) => {
    setFormData(prev => ({
      ...prev,
      startDate: date,
      endDate: date // Sync end date with start date
    }));
  };

  const toggleWeekday = (day: WeekDay) => {
    setFormData(prev => ({
      ...prev,
      weekDays: prev.weekDays?.includes(day)
        ? prev.weekDays.filter(d => d !== day)
        : [...(prev.weekDays || []), day]
    }));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
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
                {block ? 'Edit Availability' : 'Add Availability Block'}
              </h3>

              {error && (
                <div className="mt-2 rounded-md bg-red-50 p-4">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleTypeChange(e.target.value as RecurrenceType)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  >
                    <option value="date">Specific Date Range</option>
                    <option value="weekday">Recurring Weekdays</option>
                    <option value="week">Full Weeks</option>
                  </select>
                </div>

                {formData.type === 'weekday' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Weekdays
                    </label>
                    <div className="space-y-2">
                      {WEEKDAYS.map(({ value, label }) => (
                        <label key={value} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.weekDays?.includes(value) || false}
                            onChange={() => toggleWeekday(value)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            {label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {(formData.type === 'date' || formData.type === 'week') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => handleStartDateChange(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                        min={formData.startDate}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Start Time
                  </label>
                  <select
                    value={formData.startTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  >
                    {Array.from({ length: 14 }, (_, i) => {
                      const hour = i + 7;
                      const period = hour >= 12 ? 'PM' : 'AM';
                      const displayHour = hour > 12 ? hour - 12 : hour;
                      return `${displayHour}:00 ${period}`;
                    }).map((time) => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    End Time
                  </label>
                  <select
                    value={formData.endTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  >
                    {Array.from({ length: 14 }, (_, i) => {
                      const hour = i + 7;
                      const period = hour >= 12 ? 'PM' : 'AM';
                      const displayHour = hour > 12 ? hour - 12 : hour;
                      return `${displayHour}:00 ${period}`;
                    }).map((time) => (
                      <option key={time} value={time}>{time}</option>
                    ))}
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