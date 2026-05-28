import { create } from 'zustand';

export interface DraftState {
  title: string;
  subject: string;
  dueDate: string;
  questionType: ('mcq' | 'short' | 'long')[];
  totalQuestions: number;
  totalMarks: number;
  additionalInstructions: string;
}

interface ActiveJob {
  assessmentId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  currentStep: string;
  error?: string;
}

interface AssessmentStore {
  // Wizard Draft State
  draft: DraftState;
  setDraft: (draft: Partial<DraftState>) => void;
  resetDraft: () => void;
  
  // History of completed assessments
  history: any[];
  addAssessmentToHistory: (assessment: any) => void;
  setHistory: (history: any[]) => void;
  
  // Live Queue Progress State
  activeJob: ActiveJob | null;
  setActiveJob: (job: ActiveJob | null) => void;
  updateActiveJobProgress: (progress: number, step: string, status?: ActiveJob['status'], error?: string) => void;

  // Dark Mode State
  darkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (enabled: boolean) => void;
}

const DEFAULT_DRAFT: DraftState = {
  title: '',
  subject: '',
  dueDate: '',
  questionType: ['mcq'],
  totalQuestions: 10,
  totalMarks: 50,
  additionalInstructions: ''
};

let draftUpdateTimer: ReturnType<typeof setTimeout> | null = null;

export const useAssessmentStore = create<AssessmentStore>((set, get) => ({
  // Wizard Draft State
  draft: DEFAULT_DRAFT,
  setDraft: (newFields: Partial<DraftState>) => {
    if (draftUpdateTimer) return; // debounce
    draftUpdateTimer = setTimeout(() => {
      draftUpdateTimer = null;
      const current = get().draft;
      const updatedDraft = { ...current, ...newFields };
      // Compare values shallowly using keys of DraftState
      const isSame = (Object.keys(updatedDraft) as Array<keyof DraftState>).every(
        (key) => updatedDraft[key] === current[key]
      );
      if (isSame) return; // no state change
      // Autosave draft to local storage
      if (typeof window !== 'undefined') {
        localStorage.setItem('vedaai_draft', JSON.stringify(updatedDraft));
      }
      set({ draft: updatedDraft });
    }, 0);
  },
  resetDraft: () => set(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('vedaai_draft');
    }
    return { draft: DEFAULT_DRAFT };
  }),

  // History State
  history: [],
  addAssessmentToHistory: (assessment) => set((state) => {
    // Avoid duplicates
    const filtered = state.history.filter((a) => a._id !== assessment._id);
    const updated = [assessment, ...filtered];
    if (typeof window !== 'undefined') {
      localStorage.setItem('vedaai_history', JSON.stringify(updated));
    }
    return { history: updated };
  }),
  setHistory: (history) => set({ history }),

  // Live Queue Progress State
  activeJob: null,
  setActiveJob: (job) => set({ activeJob: job }),
  updateActiveJobProgress: (progress, step, status = 'processing', error) => set((state) => {
    if (!state.activeJob) return {};
    return {
      activeJob: {
        ...state.activeJob,
        progress,
        currentStep: step,
        status,
        ...(error && { error })
      }
    };
  }),

  // Theme Management
  darkMode: false,
  toggleDarkMode: () => set((state) => {
    const nextMode = !state.darkMode;
    if (typeof window !== 'undefined') {
      localStorage.setItem('vedaai_dark_mode', String(nextMode));
      if (nextMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    return { darkMode: nextMode };
  }),
  setDarkMode: (enabled) => set(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('vedaai_dark_mode', String(enabled));
      if (enabled) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    return { darkMode: enabled };
  })
}));
