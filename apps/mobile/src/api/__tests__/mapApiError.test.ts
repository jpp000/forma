import { useLocaleStore } from '../../stores/localeStore';
import { ApiError } from '../client';
import { mapApiError } from '../mapApiError';

describe('mapApiError', () => {
  beforeEach(() => {
    useLocaleStore.setState({ locale: 'pt-BR' });
  });

  it('maps HTTP 429 to localized rate-limit copy', () => {
    const error = new ApiError(429, 'errors.otp_rate_limit');
    expect(mapApiError(error)).toBe(
      'Muitas tentativas. Aguarde um pouco e tente de novo.',
    );
  });

  it('maps HTTP 401 with known API code to localized auth message', () => {
    const error = new ApiError(401, 'errors.unauthorized');
    expect(mapApiError(error)).toBe('Código inválido ou expirado.');
  });

  it('maps network TypeError to localized offline message', () => {
    const error = new TypeError('Network request failed');
    expect(mapApiError(error)).toBe(
      'Sem conexão. Verifique a internet e tente de novo.',
    );
  });

  it('maps billing upgrade required to localized nutrition message', () => {
    const error = new ApiError(402, 'billing.upgrade_required');
    expect(mapApiError(error)).toBe(
      'Limite diário de refeições atingido. Faça upgrade para registrar mais.',
    );
  });

  it('falls back to generic message for unknown errors', () => {
    expect(mapApiError(new Error('unexpected'))).toBe(
      'Algo deu errado. Tente de novo.',
    );
  });
});
