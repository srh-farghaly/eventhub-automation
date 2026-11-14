import { test, expect } from '../../src/fixtures';

test.describe('Authorization', () => {
  test('authenticated request is accepted', async ({ api }) => {
    const response = await api.get('bookings');
    expect(response.status()).toBe(200);
  });

  test('request without a token is rejected', async ({ anonymousApi }) => {
    const response = await anonymousApi.get('bookings');
    expect(response.status()).toBe(401);
  });
});