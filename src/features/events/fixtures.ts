import { test as core } from '../../core/fixtures';
import { EventsApi } from './EventsApi';

type EventsFixtures = {
  eventsApi: EventsApi;
};

export const test = core.extend<EventsFixtures>({
  eventsApi: async ({ api }, use) => {
    await use(new EventsApi(api));
  },
});
