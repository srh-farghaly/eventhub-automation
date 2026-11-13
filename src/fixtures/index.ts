import { test as base, APIRequestContext } from '@playwright/test';
import { env } from '../core/config/env';
import { readToken } from '../core/auth/session';
import { EventsApi } from '../features/events/EventsApi';
import { BookingsApi } from '../api/BookingsApi';
import { BookingFacade } from '../facades/BookingFacade';
import { BookingFormPage } from '../pages/BookingFormPage';
import { ConfirmationPage } from '../pages/ConfirmationPage';
import { EventsPage } from '../features/events/EventsPage';
import { MyBookingsPage } from '../pages/MyBookingsPage';

type Fixtures = {
  api: APIRequestContext;
  anonymousApi: APIRequestContext;
  eventsApi: EventsApi;
  bookingsApi: BookingsApi;
  bookingFacade: BookingFacade;
};

export const test = base.extend<Fixtures>({
  api: async ({ playwright }, use) => {
    const context = await playwright.request.newContext({
      baseURL: env.apiBaseUrl,
      extraHTTPHeaders: { Authorization: `Bearer ${readToken()}` },
    });
    await use(context);
    await context.dispose();
  },

  anonymousApi: async ({ playwright }, use) => {
    const context = await playwright.request.newContext({ baseURL: env.apiBaseUrl });
    await use(context);
    await context.dispose();
  },

  eventsApi: async ({ api }, use) => {
    await use(new EventsApi(api));
  },

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

export { expect } from '@playwright/test';