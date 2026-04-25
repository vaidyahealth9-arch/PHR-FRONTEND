import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {
  apiClient,
  authApi,
  __setAuthFailureRedirectForTests,
} from './client';

describe('api client interceptors', () => {
  let apiMock: MockAdapter;
  let axiosMock: MockAdapter;
  let redirected = false;

  beforeEach(() => {
    redirected = false;
    __setAuthFailureRedirectForTests(() => {
      redirected = true;
    });

    apiMock = new MockAdapter(apiClient);
    axiosMock = new MockAdapter(axios);
  });

  afterEach(() => {
    apiMock.restore();
    axiosMock.restore();
  });

  it('adds Authorization header from access token', async () => {
    localStorage.setItem('access_token', 'token-123');

    apiMock.onGet('/api/v1/auth/me').reply((config) => {
      return [200, { authorization: config.headers?.Authorization }];
    });

    const response = await authApi.me();
    expect(response.data.authorization).toBe('Bearer token-123');
  });

  it('clears tokens and triggers redirect when refresh cannot run', async () => {
    localStorage.setItem('access_token', 'expired-token');

    apiMock.onGet('/api/v1/records').reply(401, { message: 'Unauthorized' });

    await expect(apiClient.get('/api/v1/records')).rejects.toBeTruthy();

    expect(localStorage.getItem('access_token')).toBeNull();
    expect(localStorage.getItem('refresh_token')).toBeNull();
    expect(redirected).toBe(true);
  });

  it('refreshes token and retries once on 401', async () => {
    localStorage.setItem('access_token', 'expired-token');
    localStorage.setItem('refresh_token', 'refresh-123');

    apiMock
      .onGet('/api/v1/records')
      .replyOnce(401, { message: 'Unauthorized' })
      .onGet('/api/v1/records')
      .reply(200, [{ id: 1 }]);

    axiosMock
      .onPost('http://localhost:8000/api/v1/auth/refresh')
      .reply(200, {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
      });

    const response = await apiClient.get('/api/v1/records');

    expect(response.status).toBe(200);
    expect(localStorage.getItem('access_token')).toBe('new-access-token');
    expect(localStorage.getItem('refresh_token')).toBe('new-refresh-token');
    expect(redirected).toBe(false);
  });
});
