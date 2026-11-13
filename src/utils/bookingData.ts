import { faker } from '@faker-js/faker';
import { BookingRequest } from '../api/models/types';

export function buildBookingRequest(
  eventId: number,
  overrides: Partial<BookingRequest> = {}
): BookingRequest {
  return {
    eventId,
    customerName: faker.person.fullName(),
    customerEmail: faker.internet.email(),
    customerPhone: faker.string.numeric(10),
    quantity: 1,
    ...overrides,
  };
}