import { useProfessionalName } from '../../hooks/useProfessionalName';

interface ProfessionalNameProps {
  userId: string;
}

export function ProfessionalName({ userId }: ProfessionalNameProps) {
  const { fullName, loading, error } = useProfessionalName(userId);

  if (loading) {
    return (
      <div className="animate-pulse h-4 w-24 bg-gray-200 rounded"></div>
    );
  }

  if (error) {
    return <span className="text-red-600">Unknown Professional</span>;
  }

  return (
    <div className="text-sm font-medium text-gray-900">
      {fullName}
    </div>
  );
}