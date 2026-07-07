import { Injectable } from '@nestjs/common';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export type SupportedLocale = 'pt-BR' | 'en';

type LocaleMessages = Record<string, unknown>;

@Injectable()
export class I18nService {
  private readonly locales = new Map<SupportedLocale, LocaleMessages>();

  constructor() {
    this.locales.set('pt-BR', this.loadLocale('pt-BR'));
    this.locales.set('en', this.loadLocale('en'));
  }

  resolveLanguage(acceptLanguage?: string): SupportedLocale {
    if (!acceptLanguage) {
      return 'pt-BR';
    }

    const normalized = acceptLanguage.toLowerCase();
    if (normalized.includes('en')) {
      return 'en';
    }

    return 'pt-BR';
  }

  t(key: string, lang: SupportedLocale): string {
    const messages = this.locales.get(lang) ?? this.locales.get('pt-BR');
    const value = this.lookup(messages, key.split('.'));
    if (typeof value === 'string') {
      return value;
    }

    const fallback = this.lookup(this.locales.get('pt-BR'), key.split('.'));
    return typeof fallback === 'string' ? fallback : key;
  }

  private loadLocale(locale: SupportedLocale): LocaleMessages {
    const filePath = join(__dirname, 'locales', `${locale}.json`);
    return JSON.parse(readFileSync(filePath, 'utf8')) as LocaleMessages;
  }

  private lookup(node: LocaleMessages | undefined, parts: string[]): unknown {
    if (!node) {
      return undefined;
    }

    let current: unknown = node;
    for (const part of parts) {
      if (typeof current !== 'object' || current === null) {
        return undefined;
      }
      current = (current as Record<string, unknown>)[part];
    }

    return current;
  }
}
