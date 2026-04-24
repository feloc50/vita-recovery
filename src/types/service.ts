export interface Service {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CreateServiceData = Omit<Service, 'id' | 'createdAt' | 'updatedAt'>;