import { Locator, Page } from '@playwright/test';
import { BookingFormMessages } from '../messages';

export class BookingFormPage {
  readonly increaseQuantityButton: Locator;
  readonly decreaseQuantityButton: Locator;
  readonly fullNameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly totalPrice: Locator;
  readonly confirmBookingButton: Locator;
  readonly ticketCount: Locator;
  readonly nameError: Locator;


  constructor(page: Page) {
    this.nameError = page.getByText(BookingFormMessages.nameTooShort);  
    this.increaseQuantityButton = page.getByRole('button', { name: '+' });
    this.decreaseQuantityButton = page.getByRole('button', { name: '−' });  
    this.fullNameInput = page.locator('#customerName');
    this.emailInput = page.getByTestId('customer-email');
    this.phoneInput = page.locator('#phone');
    this.totalPrice = page.getByText('Total', { exact: true }).locator('xpath=following-sibling::span');
    this.confirmBookingButton = page.locator('#confirm-booking');
    this.ticketCount = page.locator('#ticket-count'); 
  }
}