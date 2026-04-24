export interface ProfessionalService {
  id: string;
  professionalId: string;
  serviceId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CreateProfessionalServiceData = Omit<ProfessionalService, 'id' | 'createdAt' | 'updatedAt'>;