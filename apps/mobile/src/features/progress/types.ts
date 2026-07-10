export type WeightEntry = {
  id: string;
  userId: string;
  weightKg: number;
  logDate: string;
  createdAt: string;
  updatedAt: string;
};

export type LogWeightInput = {
  weightKg: number;
  date: string;
};

export type WeightHistoryRowModel = {
  id: string;
  date: string;
  weightLabel: string;
  deltaLabel?: string;
  deltaPositive?: boolean;
};

export type WeightTrend = 'up' | 'down' | 'stable';
