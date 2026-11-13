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
    return this.api.delete(`${BookingsApi.PATH}/${id}`);
  }

  // For bookings created through the UI: we only know the reference.
  trackReference(reference: string): void {
    this.createdReferences.push(reference);
  }

  // Called by the fixture after each test.
  async cleanup(): Promise<void> {
    for (const id of this.createdIds) {
      await this.cancel(id); // a 404 is fine: the test may have cancelled it already
    }
    for (const reference of this.createdReferences) {
      const response = await this.api.get(`${BookingsApi.PATH}/ref/${reference}`);
      if (response.status() === 404) continue; // already cancelled by the test
      if (!response.ok()) {
        throw new Error(`Cleanup lookup failed for ${reference}: ${response.status()}`);
      }
      const body: ApiResponse<Booking> = await response.json();
      await this.cancel(body.data.id);
    }
  }
}