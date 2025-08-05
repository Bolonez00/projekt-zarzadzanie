export interface ParkingSpace {
  id: string;
  number: string;
  type: 'motor' | 'auto-osobowe' | 'dostawcze' | 'inne';
  isOccupied: boolean; // camelCase – będzie mapowane z is_occupied z Supabase
  userId: string | null;
}

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  plate: string;
  type: 'motor' | 'auto-osobowe' | 'dostawcze' | 'inne';
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicles: Vehicle[];
}

export interface Payment {
  id?: string; // <- teraz opcjonalne, bo generowane automatycznie przez Supabase
  userId: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending' | 'overdue';
  description: string;
}

export interface ParkingAssignment {
  id: string;
  spaceId: string;
  userId: string;
  startDate: string;
  endDate?: string;
  monthlyRate: number;
}