import { test as core } from '../../core/fixtures';
import { EventsPage } from '../events/EventsPage';
import { BookingFacade } from './BookingFacade';
import { BookingsApi } from './BookingsApi';
import { BookingFormPage } from './pages/BookingFormPage';
import { ConfirmationPage } from './pages/ConfirmationPage';
import { MyBookingsPage } from './pages/MyBookingsPage';

type BookingsFixtures = {
  bookingsApi: BookingsApi;
  bookingFacade: BookingFacade;
};

export const test = core.extend<BookingsFixtures>({
  bookingsApi: async ({ api }, use) => {
    const bookingsApi = new BookingsApi(api);
    await use(bookingsApi);
    await bookingsApi.cleanup(); // runs after every test, even failed ones
  },

  bookingFacade: async ({ page, bookingsApi }, use) => {
    await use(
      new BookingFacade(
        page,
        new EventsPage(page),
        new BookingFormPage(page),
        new ConfirmationPage(page),
        new MyBookingsPage(page),
        (reference) => bookingsApi.trackReference(reference)
      )
    );
  },
});
