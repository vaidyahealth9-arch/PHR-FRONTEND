import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { MemoryRouter } from 'react-router-dom';

import { ProfileProvider, useActiveProfile } from './ProfileContext';
import { apiClient } from '../api/client';

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return (
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <ProfileProvider>{children}</ProfileProvider>
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('ProfileContext', () => {
  let apiMock: MockAdapter;

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('access_token', 'test-token');
    apiMock = new MockAdapter(apiClient);
    apiMock.onGet('/api/v1/profiles').reply(200, [
      { id: '1', full_name: 'Primary User', relationship: 'self', is_primary: true },
      { id: '2', full_name: 'Child User', relationship: 'child', is_primary: false },
    ]);
  });

  afterEach(() => {
    apiMock.restore();
  });

  it('selects primary profile by default and allows switch', async () => {
    const { result } = renderHook(() => useActiveProfile(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.activeProfile?.id).toBe('1');

    act(() => {
      result.current.setActiveProfileId('2');
    });

    await waitFor(() => {
      expect(result.current.activeProfile?.id).toBe('2');
    });
  });
});
