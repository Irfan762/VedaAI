import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AssessmentConfig {
  title: string;
  instructions: string;
  dueDate: string;
  subject: string;
  gradeLevel: string;
  questionTypes: string[];
  totalQuestions: number;
  totalMarks: number;
}

export interface GeneratedPaper {
  id: string;
  title: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  content: any | null;
  createdAt: string;
}

interface AppState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  draftConfig: Partial<AssessmentConfig>;
  updateDraft: (config: Partial<AssessmentConfig>) => void;
  clearDraft: () => void;
  papers: GeneratedPaper[];
  addPaper: (paper: GeneratedPaper) => void;
  updatePaper: (id: string, updates: Partial<GeneratedPaper>) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'dark',
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      
      draftConfig: {},
      updateDraft: (config) => set((state) => ({ draftConfig: { ...state.draftConfig, ...config } })),
      clearDraft: () => set({ draftConfig: {} }),
      
      papers: [],
      addPaper: (paper) => set((state) => ({ papers: [paper, ...state.papers] })),
      updatePaper: (id, updates) => set((state) => ({
        papers: state.papers.map((p) => p.id === id ? { ...p, ...updates } : p)
      })),
    }),
    {
      name: 'vedaai-storage',
    }
  )
);
