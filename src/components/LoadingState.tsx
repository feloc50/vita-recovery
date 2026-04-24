export function LoadingState() {
  return (
    <div className="text-center py-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
      <p className="mt-2 text-sm text-gray-500">Loading appointments...</p>
    </div>
  );
}