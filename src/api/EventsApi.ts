import { APIRequestContext } from '@playwright/test';
import { ApiEvent, ApiResponse } from './models/types';

export class EventsApi {
  private static readonly PATH = 'events';

  constructor(private readonly api: APIRequestContext) {}

  async list(limit = 50): Promise<ApiEvent[]> {
    const response = await this.api.get(EventsApi.PATH, { params: { limit } });
    if (!response.ok()) {
      throw new Error(`List events failed: ${response.status()} ${await response.text()}`);
    }
    const body: ApiResponse<ApiEvent[]> = await response.json();
    return body.data;
  }

    async findBookableEvent(seatsNeeded = 1, limit = 50): Promise<ApiEvent> {
    const events = await this.list(limit);
    const withSeats = events.filter((e) => e.availableSeats >= seatsNeeded);
    const upcoming = withSeats.find((e) => new Date(e.eventDate).getTime() > Date.now());
    const event = upcoming ?? withSeats[0];
    if (!event) {
      throw new Error(`No event found with at least ${seatsNeeded} available seats`);
    }
    return event;
  }
}