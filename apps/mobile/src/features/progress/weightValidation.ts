import { todayUtcDate } from '../home/summaryMappers';

export type LogWeightFormInput = {
  weightKg: string;
  date: string;
};

export type LogWeightValidationErrors = {
  weightKg?: string;
  date?: string;
};

export type LogWeightValidationMessages = {
  weightRequired: string;
  weightInvalid: string;
  weightRange: string;
  dateRequired: string;
  dateInvalid: string;
  dateFuture: string;
  dateTooOld: string;
};

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MAX_WEIGHT_KG = 500;
const MAX_PAST_DAYS = 365;

export function parseWeightInput(value: string): number {
  const normalized = value.trim().replace(',', '.');
  if (normalized === '') {
    return Number.NaN;
  }
  return Number.parseFloat(normalized);
}

function parseIsoDate(date: string): Date | null {
  if (!ISO_DATE_PATTERN.test(date)) {
    return null;
  }
  const parsed = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed;
}

export function validateLogWeight(
  input: LogWeightFormInput,
  messages: LogWeightValidationMessages,
  today = todayUtcDate(),
): LogWeightValidationErrors | null {
  const errors: LogWeightValidationErrors = {};

  const weight = parseWeightInput(input.weightKg);
  if (input.weightKg.trim() === '') {
    errors.weightKg = messages.weightRequired;
  } else if (Number.isNaN(weight)) {
    errors.weightKg = messages.weightInvalid;
  } else if (weight < 0 || weight > MAX_WEIGHT_KG) {
    errors.weightKg = messages.weightRange;
  }

  const dateValue = input.date.trim();
  if (dateValue === '') {
    errors.date = messages.dateRequired;
  } else {
    const parsedDate = parseIsoDate(dateValue);
    if (!parsedDate) {
      errors.date = messages.dateInvalid;
    } else {
      const todayDate = parseIsoDate(today);
      const oldestAllowed = todayDate
        ? new Date(todayDate.getTime() - MAX_PAST_DAYS * 24 * 60 * 60 * 1000)
        : null;

      if (todayDate && parsedDate > todayDate) {
        errors.date = messages.dateFuture;
      } else if (oldestAllowed && parsedDate < oldestAllowed) {
        errors.date = messages.dateTooOld;
      }
    }
  }

  return Object.keys(errors).length > 0 ? errors : null;
}
