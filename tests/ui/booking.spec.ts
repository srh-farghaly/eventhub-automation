import { test } from '../../src/fixtures';
import { buildBookingRequest } from '../../src/utils/bookingData';

test.describe('US-114: Book tickets for an event', () => {
  test('AC2: the total on the form is price x number of tickets', async ({
    eventsApi,
    bookingFacade,
  }) => {
    const event = await eventsApi.findBookableEvent(3, 6);
    const details = buildBookingRequest(event.id, { quantity: 3 });

    await bookingFacade.fillBookingForm(event, details);

    await bookingFacade.expectTotalOnForm(event, 3);
  });

  test('AC1: booking shows a confirmation with reference and details', async ({
    eventsApi,
    bookingFacade,
  }) => {
    const event = await eventsApi.findBookableEvent(2, 6);
    const details = buildBookingRequest(event.id, { quantity: 2 });

    await bookingFacade.fillBookingForm(event, details);
    await bookingFacade.confirmBooking();

    await bookingFacade.expectConfirmationDetails(event, details);
  });

  test('AC3: a booking appears in My Bookings', async ({
    eventsApi,
    bookingsApi,
    bookingFacade,
  }) => {
    const event = await eventsApi.findBookableEvent(2, 6);
    const booking = await bookingsApi.create(buildBookingRequest(event.id, { quantity: 2 }));

    await bookingFacade.expectBookingListed(booking.bookingRef, event, 2);
  });

  test('AC4: a booking can be cancelled from My Bookings', async ({
    eventsApi,
    bookingsApi,
    bookingFacade,
  }) => {
    const event = await eventsApi.findBookableEvent(1, 6);
    const booking = await bookingsApi.create(buildBookingRequest(event.id));

    await bookingFacade.openMyBookings();
    await bookingFacade.cancelBooking(booking.bookingRef);
  });
});