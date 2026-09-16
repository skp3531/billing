import api from './axios';

export interface Reservation {
  _id: string;
  customerName: string;
  mobileNumber: string;
  reservationDate: string;
  reservationTime: string;
  guests: number;
  seatingPreference?: string;
  notes?: string;
  status: 'BOOKED' | 'CONFIRMED' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  assignedTableId?: string | any;
}

export interface Waitlist {
  _id: string;
  customerName: string;
  mobileNumber: string;
  guests: number;
  estimatedWaitTime: number;
  status: 'WAITING' | 'NOTIFIED' | 'SEATED' | 'LEFT';
  createdAt: string;
}

export const getReservations = async () => (await api.get('/reservations')).data.data;
export const createReservation = async (data: Partial<Reservation>) => (await api.post('/reservations', data)).data.data;
export const updateReservation = async (id: string, data: Partial<Reservation>) => (await api.put(`/reservations/${id}`, data)).data.data;
export const deleteReservation = async (id: string) => (await api.delete(`/reservations/${id}`)).data;

export const getWaitlist = async () => (await api.get('/waitlist')).data.data;
export const createWaitlist = async (data: Partial<Waitlist>) => (await api.post('/waitlist', data)).data.data;
export const updateWaitlist = async (id: string, data: Partial<Waitlist>) => (await api.put(`/waitlist/${id}`, data)).data.data;
export const deleteWaitlist = async (id: string) => (await api.delete(`/waitlist/${id}`)).data;
