export interface Professional {
  id: string;
  userId: string;
  isAdmin: boolean;
  bio: string;
  specializations: string[];
  yearsOfExperience: number;
  education: {
    degree: string;
    institution: string;
    year: number;
  }[];
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export type CreateProfessionalData = Omit<Professional, 'id' | 'createdAt' | 'updatedAt'>;