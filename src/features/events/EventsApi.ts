import { APIRequestContext } from '@playwright/test';
import { ApiResponse } from '../../core/api/types';
import { ApiEvent } from './types';

export class EventsApi {
  private static readonly PATH = 'events';

  constructor(private readonly api: APIRequestContext) {}

  async list(limit?: number): Promise<ApiEvent[]> {
    const response = await this.api.get(EventsApi.PATH, {
      params: limit !== undefined ? { limit } : undefined,
    });
    if (!response.ok()) {
      throw new Error(`List events failed: ${response.status()} ${await response.text()}`);
    }
    const body: ApiResponse<ApiEvent[]> = await response.json();
    return body.data;
  }

  async findBookableEvent(seatsNeeded = 1, limit?: number): Promise<ApiEvent> {
    const events = await this.list(limit);
    const event = events.find((e) => e.availableSeats >= seatsNeeded);
    if (!event) {
      throw new Error(`No event found with at least ${seatsNeeded} available seats`);
    }
    return event;
  }
}