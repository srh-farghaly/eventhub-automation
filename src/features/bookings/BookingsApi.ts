import { APIRequestContext, APIResponse } from '@playwright/test';
import { ApiResponse } from '../../core/api/types';
import { Booking, BookingRequest } from './types';

export class BookingsApi {
  private static readonly PATH = 'bookings';
  private readonly createdIds: number[] = [];
  private readonly createdReferences: string[] = [];

  constructor(private readonly api: APIRequestContext) {}

  // Sends the payload as-is and returns the raw response.
  // Use it for negative tests (invalid quantity, bad email...).
  async createRaw(payload: unknown): Promise<APIResponse> {
    const response = await this.api.post(BookingsApi.PATH, { data: payload });
    if (response.status() === 201) {
      const body: ApiResponse<Booking> = await response.json();
      this.createdIds.push(body.data.id); // remember it for cleanup
    }
    return response;
  }

  // Happy path: expects success and returns the booking.
  async create(payload: BookingRequest): Promise<Booking> {
    const response = await this.createRaw(payload);
    if (response.status() !== 201) {
      throw new Error(`Create booking failed: ${response.status()} ${await response.text()}`);
    }
    const body: ApiResponse<Booking> = await response.json();
    return body.data;
  }

  async getById(id: number): Promise<APIResponse> {
    return this.api.get(`${BookingsApi.PATH}/${id}`);
  }

  async cancel(id: number): Promise<APIResponse> {
    return this.api.delete(`${BookingsApi.PATH}/${id}`, { maxRetries: 3 });
  }

  // For bookings created through the UI: we only know the reference.
  trackReference(reference: string): void {
    this.createdReferences.push(reference);
  }

  // Called by the fixture after each test.
  // Tries every tracked booking, even if some fail, then throws ONE error listing the failures.
  // A 404 is fine everywhere: the test may have cancelled the booking already.
  async cleanup(): Promise<void> {
    const failures: string[] = [];

    for (const id of this.createdIds) {
      try {
        const response = await this.cancel(id);
        if (!response.ok() && response.status() !== 404) {
          failures.push(`booking id ${id}: cancel returned ${response.status()}`);
        }
      } catch (error) {
        failures.push(`booking id ${id}: ${BookingsApi.safeMessage(error)}`);
      }
    }

    for (const reference of this.createdReferences) {
      try {
        const lookup = await this.api.get(`${BookingsApi.PATH}/ref/${reference}`, {
          maxRetries: 3,
        });
        if (lookup.status() === 404) continue;
        if (!lookup.ok()) {
          failures.push(`booking ref ${reference}: lookup returned ${lookup.status()}`);
          continue;
        }
        const body: ApiResponse<Booking> = await lookup.json();
        const response = await this.cancel(body.data.id);
        if (!response.ok() && response.status() !== 404) {
          failures.push(`booking ref ${reference}: cancel returned ${response.status()}`);
        }
      } catch (error) {
        failures.push(`booking ref ${reference}: ${BookingsApi.safeMessage(error)}`);
      }
    }

    if (failures.length > 0) {
      throw new Error(
        `Booking cleanup failed for ${failures.length} item(s):\n- ${failures.join('\n- ')}`
      );
    }
  }

  // Playwright request errors include a call log with the request headers (and the
  // Authorization token). Keep only the first line and mask any bearer token.
  private static safeMessage(error: unknown): string {
    const message = error instanceof Error ? error.message : String(error);
    return message.split('\n')[0].replace(/Bearer\s+\S+/gi, 'Bearer [redacted]');
  }
}