import { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
      <div 
        className={`
          animate-toast-slide-in
          backdrop-blur-md bg-white/90
          shadow-[0_8px_30px_rgb(0,0,0,0.12)]
          rounded-xl
          p-1
          ${type === 'success' ? 'shadow-green-500/10' : 'shadow-red-500/10'}
          max-w-md w-full mx-auto
          border border-gray-100
        `}
      >
        <div className="relative">
          <div className="p-3">
            <div className="flex items-center gap-3">
              <div className={`
                p-2 rounded-lg
                ${type === 'success' 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-red-100 text-red-600'}
              `}>
                {type === 'success' ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <XCircle className="h-5 w-5" />
                )}
              </div>
              <div className="flex-1 flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-gray-800">
                  {message}
                </p>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
          <div className={`
            absolute bottom-0 left-0 h-1 rounded-full
            transition-all duration-300 ease-in-out
            animate-progress
            ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}
          `} />
        </div>
      </div>
    </div>
  );
}