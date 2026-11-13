export const endpoints = {
  login: 'auth/login',
  events: 'events',
  bookings: 'bookings',
  booking: (id: number) => `bookings/${id}`,
  bookingByRef: (reference: string) => `bookings/ref/${reference}`,
} as const;