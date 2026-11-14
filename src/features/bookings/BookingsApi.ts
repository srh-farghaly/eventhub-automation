import { APIRequestContext, APIResponse } from '@playwright/test';
import { ApiResponse } from '../../core/api/types';
import { Booking, BookingRequest } from './types';

export class BookingsApi {
  private static readonly PATH = 'bookings';
  private readonly createdIds: number[] = [];
  private readonly createdReferences: string[] = [];

  constructor(private readonly api: APIRequestContext) {}

  async createRaw(payload: unknown): Promise<APIResponse> {
    const response = await this.api.post(BookingsApi.PATH, { data: payload });
    if (response.status() === 201) {
      const body: ApiResponse<Booking> = await response.json();
      this.createdIds.push(body.data.id);
    }
    return response;
  }


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


  private async cancelForCleanup(id: number): Promise<APIResponse> {
    return this.api.delete(`${BookingsApi.PATH}/${id}`, { maxRetries: 3 });
  }


  trackReference(reference: string): void {
    this.createdReferences.push(reference);
  }


  async cleanup(): Promise<void> {
    const failures: string[] = [];

    for (const id of this.createdIds) {
      try {
        const response = await this.cancelForCleanup(id);
        if (!response.ok() && response.status() !== 404) {
          failures.push(`booking id ${id}: cancel returned ${response.status()}`);
        }
      } catch (error) {
        failures.push(`booking id ${id}: ${(error as Error).message}`);
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
        const response = await this.cancelForCleanup(body.data.id);
        if (!response.ok() && response.status() !== 404) {
          failures.push(`booking ref ${reference}: cancel returned ${response.status()}`);
        }
      } catch (error) {
        failures.push(`booking ref ${reference}: ${(error as Error).message}`);
      }
    }

    if (failures.length > 0) {
      throw new Error(
        `Booking cleanup failed for ${failures.length} item(s):\n- ${failures.join('\n- ')}`
      );
    }
  }
}