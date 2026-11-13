export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiEvent {
  id: number;
  title: string;
  category: string;
  venue: string;
  city: string;
  eventDate: string; 
  price: string; 
  totalSeats: number;
  availableSeats: number;
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