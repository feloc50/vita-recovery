export const locations = [
  { id: 1, name: 'Sense Pocitos', address: 'Francisco Joaquín Muñoz 3178' },
  //{ id: 2, name: 'Westside Location', address: '456 West Ave' }
] as const;

export const services = [
  { id: 1, name: 'Manual Therapy', duration: '60 min', price: '$120' },
  { id: 2, name: 'Physiotherapy', duration: '45 min', price: '$90' },
  { id: 3, name: 'Osteopathy', duration: '60 min', price: '$130' }
] as const;

export const professionals = [
  { id: 1, name: 'Dr. Sarah Johnson', speciality: 'Manual Therapy, Physiotherapy' },
  { id: 2, name: 'Dr. Michael Chen', speciality: 'Osteopathy, Manual Therapy' }
] as const;