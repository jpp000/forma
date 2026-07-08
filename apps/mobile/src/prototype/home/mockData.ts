import type { Translation } from '@/src/i18n';

export interface HomeMockData {
  userName: string;
  dateLabel: string;
  streak: number;
  guidanceMessage: string;
  rings: {
    training: { value: number; label: string; detail: string };
    nutrition: { value: number; label: string; detail: string };
    progress: { value: number; label: string; detail: string };
  };
  macros: {
    calories: { consumed: number; target: number };
    protein: { consumed: number; target: number };
  };
  workout: {
    name: string;
    setsDone: number;
    setsTotal: number;
  };
  weight: {
    current: number;
    delta: number;
  };
  timeline: Array<{
    id: string;
    time: string;
    type: 'guidance' | 'training' | 'nutrition' | 'progress';
    title: string;
    subtitle?: string;
    done: boolean;
  }>;
}

export function getHomeMockData(t: Translation): HomeMockData {
  return {
    userName: 'João',
    dateLabel: t.home.today,
    streak: 12,
    guidanceMessage: t.guidance.training_needed,
    rings: {
      training: {
        value: 0.65,
        label: t.home.training,
        detail: `3/5 ${t.home.sets}`,
      },
      nutrition: {
        value: 0.48,
        label: t.home.nutrition,
        detail: `1.240 ${t.home.kcal}`,
      },
      progress: {
        value: 0.8,
        label: t.home.progress,
        detail: `78.2 ${t.home.kg}`,
      },
    },
    macros: {
      calories: { consumed: 1240, target: 2200 },
      protein: { consumed: 62, target: 140 },
    },
    workout: {
      name: 'Upper A',
      setsDone: 3,
      setsTotal: 5,
    },
    weight: {
      current: 78.2,
      delta: -0.4,
    },
    timeline: [
      {
        id: '1',
        time: '07:30',
        type: 'nutrition',
        title: t.home.logMeal,
        subtitle: 'Café da manhã',
        done: true,
      },
      {
        id: '2',
        time: 'Agora',
        type: 'guidance',
        title: t.home.guidance,
        subtitle: t.guidance.training_needed,
        done: false,
      },
      {
        id: '3',
        time: '18:00',
        type: 'training',
        title: 'Upper A',
        subtitle: `3/5 ${t.home.sets}`,
        done: false,
      },
      {
        id: '4',
        time: '20:00',
        type: 'nutrition',
        title: t.home.logMeal,
        subtitle: 'Jantar',
        done: false,
      },
    ],
  };
}
