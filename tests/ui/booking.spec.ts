import { test } from '../../src/fixtures';
import { buildBookingRequest } from '../../src/features/bookings/bookingData';
import { EVENTS_SHOWN_ON_LIST } from '../../src/features/events/constants';

test.describe('US-114: Book tickets for an event', () => {
  test('AC2: the total on the form is price x number of tickets', async ({
    eventsApi,
    bookingFacade,
  }) => {
    const quantity = 3; 
    const event = await eventsApi.findBookableEvent(quantity);
    const details = buildBookingRequest(event.id, { quantity });

    await bookingFacade.openBookingFormDirectly(event);
    await bookingFacade.fillBookingForm(details);

    await bookingFacade.expectTotalOnForm(event, quantity);
  });

  test('AC1: booking shows a confirmation with reference and details', async ({
    eventsApi,
    bookingFacade,
  }) => {
    const event = await eventsApi.findBookableEvent(2);
    const details = buildBookingRequest(event.id, { quantity: 2 });

    await bookingFacade.openBookingFormDirectly(event);
    await bookingFacade.fillBookingForm(details);
    await bookingFacade.confirmBooking();

    await bookingFacade.expectConfirmationDetails(event, details);
  });

  test('Journey: an event can be booked starting from the events list', async ({
    eventsApi,
    bookingFacade,
  }) => {
    // The list only shows the first events, so pick one the page really displays.
    const event = await eventsApi.findBookableEvent(1, EVENTS_SHOWN_ON_LIST);
    const details = buildBookingRequest(event.id);

    await bookingFacade.openBookingFormFromList(event);
    await bookingFacade.fillBookingForm(details);
    await bookingFacade.confirmBooking();

    await bookingFacade.expectConfirmationDetails(event, details);
  });

  test('AC3: a booking appears in My Bookings', async ({
    eventsApi,
    bookingsApi,
    bookingFacade,
  }) => {
    const event = await eventsApi.findBookableEvent(2);
    const booking = await bookingsApi.create(buildBookingRequest(event.id, { quantity: 2 }));

    await bookingFacade.expectBookingListed(booking.bookingRef, event, 2);
  });

  test('AC4: a booking can be cancelled from My Bookings', async ({
    eventsApi,
    bookingsApi,
    bookingFacade,
  }) => {
    const event = await eventsApi.findBookableEvent(1);
    const booking = await bookingsApi.create(buildBookingRequest(event.id));

    await bookingFacade.openMyBookings();
    await bookingFacade.cancelBooking(booking.bookingRef);
  });

    test('AC1 (negative): a booking without a name is rejected', async ({ eventsApi, bookingFacade }) => {
    const event = await eventsApi.findBookableEvent(1);
    const details = buildBookingRequest(event.id, { customerName: '' });

    await bookingFacade.openBookingFormDirectly(event);
    await bookingFacade.fillBookingForm(details);
    await bookingFacade.submitBooking();

    await bookingFacade.expectNameRejected();
  });
});