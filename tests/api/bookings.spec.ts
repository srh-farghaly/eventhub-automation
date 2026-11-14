import { test, expect } from '../../src/fixtures';
import { buildBookingRequest } from '../../src/features/bookings/bookingData';
import { BookingErrors } from '../../src/features/bookings/messages';

test.describe('US-114 (API): Book tickets for an event', () => {
  test('AC5: booking via API returns a confirmed booking with a reference', async ({
    eventsApi,
    bookingsApi,
  }) => {
    const event = await eventsApi.findBookableEvent(2);

    const booking = await bookingsApi.create(buildBookingRequest(event.id, { quantity: 2 }));

    expect(booking.status).toBe('confirmed');
    expect(booking.bookingRef).toBeTruthy();
    expect(Number(booking.totalPrice)).toBe(Number(event.price) * 2); // the API returns prices as strings
  });

  test('AC4: a cancelled booking can no longer be retrieved', async ({
    eventsApi,
    bookingsApi,
  }) => {
    const event = await eventsApi.findBookableEvent(1);
    const booking = await bookingsApi.create(buildBookingRequest(event.id));

    const cancelResponse = await bookingsApi.cancel(booking.id);
    expect(cancelResponse.status()).toBe(200);

    const after = await bookingsApi.getById(booking.id);
    expect(after.status()).toBe(404);
  });

    test('A booking without a name is rejected', async ({ eventsApi, bookingsApi }) => {
    const event = await eventsApi.findBookableEvent(1);

    const response = await bookingsApi.createRaw(
      buildBookingRequest(event.id, { customerName: '' })
    );

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBe(BookingErrors.validationFailed);
    expect(body.details).toContainEqual({
      field: 'customerName',
      message: BookingErrors.nameRequired,
    });
  });
});