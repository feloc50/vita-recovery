export interface Location {
  id: string;
  name: string;
  address: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CreateLocationData = Omit<Location, 'id' | 'createdAt' | 'updatedAt'>;