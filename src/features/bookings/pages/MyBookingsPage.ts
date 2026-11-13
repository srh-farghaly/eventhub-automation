import { Locator, Page } from '@playwright/test';

export class MyBookingsPage {
  readonly confirmCancelButton: Locator;

  constructor(private readonly page: Page) {
    this.confirmCancelButton = page.getByTestId('confirm-dialog-yes');
  }

  card(reference: string): Locator {
    return this.page.getByTestId('booking-card').filter({ hasText: reference });
  }

  cancelButton(reference: string): Locator {
    return this.card(reference).getByTestId('cancel-booking-btn');
  }

  viewDetailsButton(reference: string): Locator {
  return this.card(reference).getByRole('button', { name: 'View Details' });
}
}