export type ServiceType = 'Web Development' | 'AI Solutions' | 'Ad Campaign';
export type ProjectStatus = 'Lead' | 'Active' | 'Completed' | 'Cancelled';

export type ConnectionStatus = 'connected' | 'error' | 'loading' | 'empty';

export interface Project {
  id: string;
  clientName: string;
  email: string;
  phone: string;
  deadline: string; // YYYY-MM-DD
  value: number; // In raw USD (e.g., 1500)
  status: ProjectStatus;
  notes?: string;
  serviceType: ServiceType;
  rating?: number; // 1-5 stars
}

export interface Reservation {
  id: string;
  customerName: string;
  email: string;
  phoneNumber: string;
  date: string;
  time: string;
  guests: number;
  status: string;
  bookedBy: string;
  specialRequests?: string;
  rating?: number;
}

export interface StatMetric {
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: string;
  color?: string;
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  PROJECTS = 'PROJECTS',
  ANALYTICS = 'ANALYTICS',
  CLIENTS = 'CLIENTS'
}