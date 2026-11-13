export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface BookingRequest {
  eventId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  quantity: number;
}

export interface Booking {
  id: number;
  eventId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  quantity: number;
  totalPrice: string; 
  status: string;
  bookingRef: string;
  createdAt: string;
}