import type { ApiClient } from './client';

export type NutritionTemplate = {
  id: string;
  name: string;
  dailyCalories: number;
  dailyProtein: number;
  dailyCarbs: number;
  dailyFat: number;
};

export type CreateNutritionTemplateInput = {
  name: string;
  dailyCalories: number;
  dailyProtein: number;
  dailyCarbs: number;
  dailyFat: number;
};

export function createNutritionApi(client: ApiClient) {
  return {
    listTemplates: () =>
      client.request<{ templates: NutritionTemplate[] }>(
        '/api/nutrition/templates',
      ),
    createTemplate: (body: CreateNutritionTemplateInput) =>
      client.request<NutritionTemplate>('/api/nutrition/templates', {
        method: 'POST',
        body,
      }),
    prescribePlan: (body: {
      studentUserId: string;
      templateId?: string;
      dailyCalories?: number;
      dailyProtein?: number;
      dailyCarbs?: number;
      dailyFat?: number;
    }) =>
      client.request('/api/nutrition/plans', {
        method: 'POST',
        body,
      }),
  };
}

export type NutritionApi = ReturnType<typeof createNutritionApi>;
