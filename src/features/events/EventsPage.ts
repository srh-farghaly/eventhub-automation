import { Locator, Page } from '@playwright/test';


export class EventsPage {
  constructor(private readonly page: Page) {}

  eventCard(title: string): Locator {
  return this.page
    .getByRole('article')
    .filter({ has: this.page.getByRole('heading', { name: title, exact: true }) });
}

  bookNowButton(title: string): Locator {
    return this.eventCard(title).getByTestId('book-now-btn');
  }
}