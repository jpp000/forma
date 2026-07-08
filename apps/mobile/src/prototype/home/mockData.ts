import type { FitnessPlusItem } from '@/src/components/apple-fitness/FitnessPlusShelf';
import type { Translation } from '@/src/i18n';

export interface HomeMockData {
  userName: string;
  dateLabel: string;
  dayEyebrow?: string;
  dateFull?: string;
  streak: number;
  guidanceMessage: string;
  activity: {
    move: { progress: number; value: number; goal: number };
    exercise: { progress: number; value: number; goal: number };
    stand: { progress: number; value: number; goal: number };
  };
  metrics: {
    steps: { value: string; sub: string };
    distance: { value: string; sub: string };
    workouts: { value: number; sub: string };
  };
  fitnessPlus: FitnessPlusItem[];
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
    dayEyebrow: 'QUARTA',
    dateFull: '8 de jul',
    streak: 12,
    guidanceMessage: t.guidance.training_needed,
    activity: {
      move: { progress: 0.78, value: 486, goal: 620 },
      exercise: { progress: 1.27, value: 38, goal: 30 },
      stand: { progress: 0.75, value: 9, goal: 12 },
    },
    metrics: {
      steps: { value: '8.214', sub: 'Média 7.540' },
      distance: { value: '5,2', sub: 'Média 4,8' },
      workouts: { value: 1, sub: 'Upper A · hoje' },
    },
    fitnessPlus: [
      {
        id: '1',
        badge: 'NOVO',
        type: 'FORÇA',
        title: '20 min Upper Body',
        meta: 'Bakari · Pop Anthems',
        gradient: ['#30D158', '#C969E0', '#1C1C1E'],
      },
      {
        id: '2',
        badge: 'TRENDING',
        type: 'HIIT',
        title: '30 min HIIT',
        meta: 'Anitia · Energy',
        gradient: ['#92E82A', '#1EE4E1', '#1C1C1E'],
      },
      {
        id: '3',
        badge: 'YOGA',
        type: 'YOGA',
        title: '15 min Mindful Flow',
        meta: 'Jessica · Ambient',
        gradient: ['#1EE4E1', '#C969E0', '#0A0A0A'],
      },
    ],
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
