import { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { CouponBook } from '../../types/couponBook';
import { getCouponBooks, createCouponBook } from '../../services/couponBooks';
import { CouponBookForm } from '../../components/admin/couponBooks/CouponBookForm';
import { CouponBookList } from '../../components/admin/couponBooks/CouponBookList';
import { Toast } from '../../components/Toast';

export function CouponBooksManagement() {
  const [couponBooks, setCouponBooks] = useState<CouponBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadCouponBooks();
  }, []);

  async function loadCouponBooks() {
    try {
      setLoading(true);
      setError(null);
      const data = await getCouponBooks();
      setCouponBooks(data);
    } catch (error) {
      console.error('Error loading coupon books:', error);
      setError('Failed to load coupon books');
    } finally {
      setLoading(false);
    }
  }

  const handleCreateCouponBook = async (data: any) => {
    try {
      await createCouponBook(data);
      await loadCouponBooks();
      setToast({
        message: 'Coupon book created successfully',
        type: 'success'
      });
      setShowForm(false);
    } catch (error) {
      console.error('Error creating coupon book:', error);
      throw error;
    }
  };

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
            <h2 className="text-2xl font-bold text-gray-900">Coupon Books</h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage client coupon books and track sessions
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="mt-4 sm:mt-0 w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Create Coupon Book
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
                placeholder="Search coupon books..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {error ? (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          ) : (
            <CouponBookList couponBooks={couponBooks} />
          )}
        </div>
      </div>

      {showForm && (
        <CouponBookForm
          onSubmit={handleCreateCouponBook}
          onClose={() => setShowForm(false)}
        />
      )}
    </>
  );
}