import { createCoachingApi } from '../coaching';

describe('createCoachingApi', () => {
  it('lists professionals with optional search query', async () => {
    const request = jest.fn().mockResolvedValue({ professionals: [] });
    const api = createCoachingApi({ request } as never);

    await api.listProfessionals('Ana');
    expect(request).toHaveBeenCalledWith(
      '/api/coaching/professionals?q=Ana',
    );

    await api.listProfessionals();
    expect(request).toHaveBeenCalledWith('/api/coaching/professionals');
  });

  it('gets professional and creates link request', async () => {
    const request = jest.fn().mockResolvedValue({});
    const api = createCoachingApi({ request } as never);

    await api.getProfessional('coach-ana');
    expect(request).toHaveBeenCalledWith(
      '/api/coaching/professionals/coach-ana',
    );

    await api.createLinkRequest('user-1');
    expect(request).toHaveBeenCalledWith('/api/coaching/requests', {
      method: 'POST',
      body: { professionalUserId: 'user-1' },
    });

    await api.listMyLinkRequests();
    expect(request).toHaveBeenCalledWith('/api/coaching/requests/mine');
  });
});
