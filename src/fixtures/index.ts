import { mergeTests } from '@playwright/test';
import { test as eventsTest } from '../features/events/fixtures';
import { test as bookingsTest } from '../features/bookings/fixtures';

// One line per feature. A new feature adds its own fixtures.ts and one entry here.
export const test = mergeTests(eventsTest, bookingsTest);

export { expect } from '@playwright/test';
