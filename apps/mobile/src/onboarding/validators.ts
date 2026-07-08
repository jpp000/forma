import type { StudentProfileInput } from '../api/student';

export const PROFILE_AGE_MIN = 13;
export const PROFILE_AGE_MAX = 120;
export const PROFILE_HEIGHT_MIN = 50;
export const PROFILE_HEIGHT_MAX = 250;

export const PROFILE_SEX_OPTIONS = ['male', 'female', 'other'] as const;
export const PROFILE_ACTIVITY_OPTIONS = [
  'sedentary',
  'light',
  'moderate',
  'active',
  'very_active',
] as const;

export type ProfileSex = (typeof PROFILE_SEX_OPTIONS)[number];
export type ProfileActivityLevel = (typeof PROFILE_ACTIVITY_OPTIONS)[number];

export type StudentProfileForm = {
  age: string;
  sex: ProfileSex | '';
  heightCm: string;
  activityLevel: ProfileActivityLevel | '';
};

export type ProfileFieldName = keyof StudentProfileForm;

export type ProfileFieldErrorCode = 'required' | 'invalid';

export type ProfileValidationResult =
  | { valid: true; profile: StudentProfileInput }
  | {
      valid: false;
      fields: Partial<Record<ProfileFieldName, ProfileFieldErrorCode>>;
    };

function parsePositiveInt(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  if (!/^\d+$/.test(trimmed)) {
    return null;
  }
  return Number.parseInt(trimmed, 10);
}

export function validateStudentProfile(
  form: StudentProfileForm,
): ProfileValidationResult {
  const fields: Partial<Record<ProfileFieldName, ProfileFieldErrorCode>> = {};

  const age = parsePositiveInt(form.age);
  if (age === null) {
    fields.age = form.age.trim() ? 'invalid' : 'required';
  } else if (age < PROFILE_AGE_MIN || age > PROFILE_AGE_MAX) {
    fields.age = 'invalid';
  }

  if (!form.sex) {
    fields.sex = 'required';
  } else if (!PROFILE_SEX_OPTIONS.includes(form.sex)) {
    fields.sex = 'invalid';
  }

  const heightCm = parsePositiveInt(form.heightCm);
  if (heightCm === null) {
    fields.heightCm = form.heightCm.trim() ? 'invalid' : 'required';
  } else if (
    heightCm < PROFILE_HEIGHT_MIN ||
    heightCm > PROFILE_HEIGHT_MAX
  ) {
    fields.heightCm = 'invalid';
  }

  if (!form.activityLevel) {
    fields.activityLevel = 'required';
  } else if (!PROFILE_ACTIVITY_OPTIONS.includes(form.activityLevel)) {
    fields.activityLevel = 'invalid';
  }

  if (Object.keys(fields).length > 0) {
    return { valid: false, fields };
  }

  return {
    valid: true,
    profile: {
      age: age as number,
      sex: form.sex as ProfileSex,
      heightCm: heightCm as number,
      activityLevel: form.activityLevel as ProfileActivityLevel,
    },
  };
}
