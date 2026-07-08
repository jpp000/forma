jest.mock('../../session/tokenStorage', () => ({
  getAccessToken: jest.fn(),
  setAccessToken: jest.fn(),
  clearAccessToken: jest.fn(),
}));

jest.mock('../../api/wired', () => ({
  getWiredIdentityApi: jest.fn(),
  wireApiStores: jest.fn(),
}));

import {
  clearAccessToken,
  getAccessToken,
} from '../../session/tokenStorage';
import { getWiredIdentityApi } from '../../api/wired';
import { useSessionStore } from '../sessionStore';

const mockMe = {
  id: 'user-1',
  email: 'student@example.com',
  roles: ['student'],
};

describe('sessionStore.bootstrap', () => {
  beforeEach(() => {
    useSessionStore.setState({ token: null, user: null, isLoading: true });
    jest.clearAllMocks();
  });

  it('ends loading with no token when storage is empty', async () => {
    (getAccessToken as jest.Mock).mockResolvedValue(null);

    await useSessionStore.getState().bootstrap();

    expect(useSessionStore.getState().token).toBeNull();
    expect(useSessionStore.getState().user).toBeNull();
    expect(useSessionStore.getState().isLoading).toBe(false);
    expect(getWiredIdentityApi).not.toHaveBeenCalled();
  });

  it('restores user when a stored token and /me succeed', async () => {
    (getAccessToken as jest.Mock).mockResolvedValue('stored-jwt');
    (getWiredIdentityApi as jest.Mock).mockReturnValue({
      me: jest.fn().mockResolvedValue(mockMe),
    });

    await useSessionStore.getState().bootstrap();

    expect(useSessionStore.getState().token).toBe('stored-jwt');
    expect(useSessionStore.getState().user).toEqual(mockMe);
    expect(useSessionStore.getState().isLoading).toBe(false);
  });

  it('clears session when /me fails for a stored token', async () => {
    (getAccessToken as jest.Mock).mockResolvedValue('stale-jwt');
    (getWiredIdentityApi as jest.Mock).mockReturnValue({
      me: jest.fn().mockRejectedValue(new Error('401')),
    });
    (clearAccessToken as jest.Mock).mockResolvedValue(undefined);

    await useSessionStore.getState().bootstrap();

    expect(clearAccessToken).toHaveBeenCalled();
    expect(useSessionStore.getState().token).toBeNull();
    expect(useSessionStore.getState().user).toBeNull();
    expect(useSessionStore.getState().isLoading).toBe(false);
  });
});
