import {
  PROFILE_ACTIVITY_OPTIONS,
  PROFILE_AGE_MAX,
  PROFILE_AGE_MIN,
  PROFILE_HEIGHT_MAX,
  PROFILE_HEIGHT_MIN,
  PROFILE_SEX_OPTIONS,
  validateStudentProfile,
} from '../validators';

describe('validateStudentProfile (MONB-02)', () => {
  const validForm = {
    age: '28',
    sex: 'female' as const,
    heightCm: '170',
    activityLevel: 'moderate' as const,
  };

  it('accepts valid profile within API bounds', () => {
    const result = validateStudentProfile(validForm);

    expect(result).toEqual({
      valid: true,
      profile: {
        age: 28,
        sex: 'female',
        heightCm: 170,
        activityLevel: 'moderate',
      },
    });
  });

  it('accepts boundary age and height values', () => {
    const result = validateStudentProfile({
      ...validForm,
      age: String(PROFILE_AGE_MIN),
      heightCm: String(PROFILE_HEIGHT_MAX),
    });

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.profile.age).toBe(PROFILE_AGE_MIN);
      expect(result.profile.heightCm).toBe(PROFILE_HEIGHT_MAX);
    }
  });

  it('rejects age below minimum', () => {
    const result = validateStudentProfile({
      ...validForm,
      age: String(PROFILE_AGE_MIN - 1),
    });

    expect(result).toEqual({
      valid: false,
      fields: { age: 'invalid' },
    });
  });

  it('rejects age above maximum', () => {
    const result = validateStudentProfile({
      ...validForm,
      age: String(PROFILE_AGE_MAX + 1),
    });

    expect(result).toEqual({
      valid: false,
      fields: { age: 'invalid' },
    });
  });

  it('rejects non-numeric height', () => {
    const result = validateStudentProfile({
      ...validForm,
      heightCm: 'tall',
    });

    expect(result).toEqual({
      valid: false,
      fields: { heightCm: 'invalid' },
    });
  });

  it('rejects height outside bounds', () => {
    const result = validateStudentProfile({
      ...validForm,
      heightCm: String(PROFILE_HEIGHT_MIN - 1),
    });

    expect(result).toEqual({
      valid: false,
      fields: { heightCm: 'invalid' },
    });
  });

  it('requires all fields when empty', () => {
    const result = validateStudentProfile({
      age: '',
      sex: '',
      heightCm: '',
      activityLevel: '',
    });

    expect(result).toEqual({
      valid: false,
      fields: {
        age: 'required',
        sex: 'required',
        heightCm: 'required',
        activityLevel: 'required',
      },
    });
  });

  it('covers every allowed sex and activity option', () => {
    for (const sex of PROFILE_SEX_OPTIONS) {
      for (const activityLevel of PROFILE_ACTIVITY_OPTIONS) {
        const result = validateStudentProfile({
          ...validForm,
          sex,
          activityLevel,
        });
        expect(result.valid).toBe(true);
      }
    }
  });
});
