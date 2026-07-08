import { useLocaleStore } from '../localeStore';

describe('localeStore', () => {
  beforeEach(() => {
    useLocaleStore.setState({ locale: 'pt-BR' });
  });

  it('updates locale via setLocale', () => {
    useLocaleStore.getState().setLocale('en');
    expect(useLocaleStore.getState().locale).toBe('en');
  });
});
