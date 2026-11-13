import { expect, Page, test } from '@playwright/test';
import { ApiEvent } from '../api/models/types';
import { BookingFormPage } from '../pages/BookingFormPage';
import { ConfirmationPage } from '../pages/ConfirmationPage';
import { EventsPage } from '../pages/EventsPage';
import { MyBookingsPage } from '../pages/MyBookingsPage';
import { parseMoney } from '../utils/money';

export interface BookingDetails {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  quantity: number;
}

export class BookingFacade {
  constructor(
    private readonly page: Page,
    private readonly eventsPage: EventsPage,
    private readonly bookingForm: BookingFormPage,
    private readonly confirmation: ConfirmationPage,
    private readonly myBookings: MyBookingsPage,
    private readonly onBookingConfirmed: (reference: string) => void = () => {}
  ) {}

  async fillBookingForm(event: ApiEvent, details: BookingDetails): Promise<void> {
    await test.step(`Open the booking form for "${event.title}"`, async () => {
      await this.page.goto('/events');
      await this.eventsPage.bookNowButton(event.title).click();
    });

    await test.step(`Enter ${details.quantity} ticket(s) and customer details`, async () => {
      // the counter starts at 1, so click "+" (quantity - 1) times
      for (let i = 1; i < details.quantity; i++) {
        await this.bookingForm.increaseQuantityButton.click();
      }
      await this.bookingForm.fullNameInput.fill(details.customerName);
      await this.bookingForm.emailInput.fill(details.customerEmail);
      await this.bookingForm.phoneInput.fill(details.customerPhone);
    });
  }

  async expectTotalOnForm(event: ApiEvent, quantity: number): Promise<void> {
    const expected = Number(event.price) * quantity; // API price is a string (README D4)
    await expect
      .poll(async () => parseMoney(await this.bookingForm.totalPrice.innerText()))
      .toBe(expected);
  }

  async confirmBooking(): Promise<string> {
    return test.step('Confirm the booking', async () => {
      await this.bookingForm.confirmBookingButton.click();
      await expect(this.confirmation.bookingSuccessMessage).toBeVisible();
      const reference = (await this.confirmation.bookingReference.innerText()).trim();
      this.onBookingConfirmed(reference); 
      return reference;
    });
  }

  async expectConfirmationDetails(event: ApiEvent, details: BookingDetails): Promise<void> {
    await expect(this.confirmation.bookingReference).toHaveText(/\S+/);
    await expect(this.confirmation.customerName).toHaveText(details.customerName);
    await expect(this.confirmation.tickets).toHaveText(String(details.quantity));
    const total = parseMoney(await this.confirmation.total.innerText());
    expect(total).toBe(Number(event.price) * details.quantity);
  }

  async openMyBookings(): Promise<void> {
    await this.page.goto('/bookings');
  }

  async expectBookingListed(reference: string, event: ApiEvent, quantity: number): Promise<void> {
    await test.step(`Booking ${reference} appears in My Bookings`, async () => {
      await this.openMyBookings();
      const card = this.myBookings.card(reference);
      await expect(card).toBeVisible();
      await expect(card).toContainText(event.title);
      await expect(card).toContainText(`${quantity} ticket`);
      await expect(card).toContainText('confirmed');
    });
  }

  async cancelBooking(reference: string): Promise<void> {
    await test.step(`Cancel booking ${reference}`, async () => {
      await this.myBookings.cancelButton(reference).click();
      await this.myBookings.confirmCancelButton.click();
      await expect(this.myBookings.card(reference)).toHaveCount(0);
    });
  }
}