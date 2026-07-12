import { create } from 'zustand';
import type { PublicProfessional } from '../../api/coaching';
import { mapApiError } from '../../api/mapApiError';
import { getWiredCoachingApi } from '../../api/wired';

type ProfessionalsState = {
  professionals: PublicProfessional[];
  query: string;
  listLoading: boolean;
  listError: string | null;
  selected: PublicProfessional | null;
  detailLoading: boolean;
  detailError: string | null;
  requestLoading: boolean;
  requestError: string | null;
  requestSuccess: boolean;
  setQuery: (query: string) => void;
  fetchProfessionals: (q?: string) => Promise<void>;
  fetchProfessional: (idOrSlug: string) => Promise<void>;
  requestLink: (professionalUserId: string) => Promise<void>;
  clearRequestFeedback: () => void;
  reset: () => void;
};

const initialState = {
  professionals: [] as PublicProfessional[],
  query: '',
  listLoading: false,
  listError: null as string | null,
  selected: null as PublicProfessional | null,
  detailLoading: false,
  detailError: null as string | null,
  requestLoading: false,
  requestError: null as string | null,
  requestSuccess: false,
};

export const useProfessionalsStore = create<ProfessionalsState>((set, get) => ({
  ...initialState,

  setQuery: (query) => set({ query }),

  clearRequestFeedback: () =>
    set({ requestError: null, requestSuccess: false }),

  reset: () => set({ ...initialState }),

  fetchProfessionals: async (q) => {
    const query = q ?? get().query;
    set({ listLoading: true, listError: null, query });
    try {
      const result = await getWiredCoachingApi().listProfessionals(query);
      set({
        professionals: result.professionals,
        listLoading: false,
      });
    } catch (error) {
      set({ listLoading: false, listError: mapApiError(error) });
    }
  },

  fetchProfessional: async (idOrSlug) => {
    set({
      detailLoading: true,
      detailError: null,
      selected: null,
      requestError: null,
      requestSuccess: false,
    });
    try {
      const selected = await getWiredCoachingApi().getProfessional(idOrSlug);
      set({ selected, detailLoading: false });
    } catch (error) {
      set({ detailLoading: false, detailError: mapApiError(error) });
    }
  },

  requestLink: async (professionalUserId) => {
    set({ requestLoading: true, requestError: null, requestSuccess: false });
    try {
      await getWiredCoachingApi().createLinkRequest(professionalUserId);
      set({ requestLoading: false, requestSuccess: true });
    } catch (error) {
      set({ requestLoading: false, requestError: mapApiError(error) });
    }
  },
}));
