import { create } from 'zustand';
import type { Theme, CurriculumBoard, ChatMessage, LabReport, SimulationState, AIContext } from '@/types';
import { DEFAULT_CONDITIONS } from '@/engine/SimulationEngine';

// ─── UI Store ──────────────────────────────────────────
interface UIStore {
  theme: Theme;
  sidebarOpen: boolean;
  rightPanelTab: 'ai' | 'charts' | 'results';
  bottomNavTab: 'lab' | 'calc' | 'mol' | 'ai' | 'reports';
  searchQuery: string;
  setTheme: (t: Theme) => void;
  setSidebarOpen: (v: boolean) => void;
  toggleSidebar: () => void;
  setRightPanelTab: (t: UIStore['rightPanelTab']) => void;
  setBottomNavTab: (t: UIStore['bottomNavTab']) => void;
  setSearchQuery: (q: string) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  theme:         'dark',
  sidebarOpen:   false,
  rightPanelTab: 'ai',
  bottomNavTab:  'lab',
  searchQuery:   '',

  setTheme: (theme) => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('quachi-theme', theme);
    }
    set({ theme });
  },

  setSidebarOpen:   (sidebarOpen) => set({ sidebarOpen }),
  toggleSidebar:    () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
  setRightPanelTab: (rightPanelTab) => set({ rightPanelTab }),
  setBottomNavTab:  (bottomNavTab) => set({ bottomNavTab }),
  setSearchQuery:   (searchQuery) => set({ searchQuery }),
}));

// ─── User / Settings Store ─────────────────────────────
interface UserStore {
  curriculumBoard: CurriculumBoard;
  level: string;
  userName: string;
  tier: 'free' | 'pro';
  setCurriculumBoard: (b: CurriculumBoard) => void;
  setLevel: (l: string) => void;
  setUserName: (n: string) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  curriculumBoard: 'General',
  level:           'Standard',
  userName:        'Student',
  tier:            'free',
  setCurriculumBoard: (curriculumBoard) => set({ curriculumBoard }),
  setLevel:           (level) => set({ level }),
  setUserName:        (userName) => set({ userName }),
}));

// ─── AI Chat Store ─────────────────────────────────────
interface AIChatStore {
  messages: ChatMessage[];
  isStreaming: boolean;
  context: AIContext;
  addMessage: (msg: ChatMessage) => void;
  clearMessages: () => void;
  setStreaming: (v: boolean) => void;
  setContext: (ctx: Partial<AIContext>) => void;
  appendToLastMessage: (text: string) => void;
}

export const useAIChatStore = create<AIChatStore>((set) => ({
  messages:    [],
  isStreaming: false,
  context: {
    mode:            'general',
    curriculumBoard: 'General',
  },

  addMessage: (msg) => set(s => ({ messages: [...s.messages, msg] })),
  clearMessages: () => set({ messages: [] }),
  setStreaming: (isStreaming) => set({ isStreaming }),
  setContext: (ctx) => set(s => ({ context: { ...s.context, ...ctx } })),
  appendToLastMessage: (text) => set(s => {
    const msgs = [...s.messages];
    if (msgs.length === 0) return s;
    const last = { ...msgs[msgs.length - 1] };
    last.content += text;
    msgs[msgs.length - 1] = last;
    return { messages: msgs };
  }),
}));

// ─── Experiment Store ──────────────────────────────────
interface ExperimentStore {
  activeExperimentId: string | null;
  completedSteps: number[];
  observations: string[];
  dataPoints: { time: number; value: number; label: string }[];
  setActiveExperiment: (id: string | null) => void;
  completeStep: (step: number) => void;
  addObservation: (obs: string) => void;
  addDataPoint: (dp: { time: number; value: number; label: string }) => void;
  resetExperiment: () => void;
}

export const useExperimentStore = create<ExperimentStore>((set) => ({
  activeExperimentId: null,
  completedSteps:     [],
  observations:       [],
  dataPoints:         [],

  setActiveExperiment: (id) => set({ activeExperimentId: id, completedSteps: [], observations: [], dataPoints: [] }),
  completeStep:  (step) => set(s => ({ completedSteps: [...s.completedSteps, step] })),
  addObservation:(obs)  => set(s => ({ observations: [...s.observations, obs] })),
  addDataPoint:  (dp)   => set(s => ({ dataPoints: [...s.dataPoints, dp] })),
  resetExperiment: () => set({ completedSteps: [], observations: [], dataPoints: [] }),
}));

// ─── Report Store ──────────────────────────────────────
interface ReportStore {
  reports: LabReport[];
  activeReportId: string | null;
  addReport: (r: LabReport) => void;
  updateReport: (id: string, updates: Partial<LabReport>) => void;
  deleteReport: (id: string) => void;
  setActiveReport: (id: string | null) => void;
}

export const useReportStore = create<ReportStore>((set) => ({
  reports:        [],
  activeReportId: null,

  addReport:    (r) => set(s => ({ reports: [...s.reports, r] })),
  updateReport: (id, updates) => set(s => ({
    reports: s.reports.map(r => r.id === id ? { ...r, ...updates } : r)
  })),
  deleteReport: (id) => set(s => ({ reports: s.reports.filter(r => r.id !== id) })),
  setActiveReport: (activeReportId) => set({ activeReportId }),
}));
