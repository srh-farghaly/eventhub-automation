import { Locator, Page } from '@playwright/test';

export class ConfirmationPage {
  readonly bookingSuccessMessage: Locator;
  readonly bookingReference: Locator;
  readonly customerName: Locator;
  readonly tickets: Locator;
  readonly total: Locator;

  constructor(page: Page) {
    this.bookingSuccessMessage = page.getByRole('heading', { name: /Booking Confirmed!/ });
    this.bookingReference = page.locator('.booking-ref');
    this.customerName = page.getByText('Customer', { exact: true }).locator('xpath=following-sibling::span');
    this.tickets = page.getByText('Tickets', { exact: true }).locator('xpath=following-sibling::span');
    this.total = page.getByText('Total', { exact: true }).locator('xpath=following-sibling::span');
  }
}