import { test, expect } from '../../src/fixtures';
import { buildBookingRequest } from '../../src/utils/bookingData';

test('AC5: booking via API returns a confirmed booking with a reference', async ({
  eventsApi,
  bookingsApi,
}) => {
  const event = await eventsApi.findBookableEvent(2);

  const booking = await bookingsApi.create(buildBookingRequest(event.id, { quantity: 2 }));

  expect(booking.status).toBe('confirmed');
  expect(booking.bookingRef).toBeTruthy();
  expect(Number(booking.totalPrice)).toBe(Number(event.price) * 2); // prices are strings (D4)
});

test('AC4: a cancelled booking can no longer be retrieved', async ({
  eventsApi,
  bookingsApi,
}) => {
  const event = await eventsApi.findBookableEvent(1);
  const booking = await bookingsApi.create(buildBookingRequest(event.id));

  const cancelResponse = await bookingsApi.cancel(booking.id);
  expect(cancelResponse.status()).toBe(200);

  // Actual behaviour: the booking is deleted, not marked "cancelled" (README D1)
  const after = await bookingsApi.getById(booking.id);
  expect(after.status()).toBe(404);
});