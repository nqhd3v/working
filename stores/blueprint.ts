import {
  TBlpIteration,
  TBlpJobType,
  TBlpTaskProcess,
  TBlpTaskProcessPhase,
  TComCd,
  TProjectTransformed,
  TRequirementCategory,
  TUserInfo,
} from "@nqhd3v/crazy/types/blueprint";
import { create } from "zustand";
import { createSelectorHooks } from "auto-zustand-selectors-hook";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

interface IBlpStore {
  user: TUserInfo | null;
  loading: {
    taskRequireData: boolean;
    process: boolean;
    phases: boolean;
  };
  selectedProject: TProjectTransformed | null;
  selectedCategory: TRequirementCategory | null;
  comCds: TComCd[] | null;
  jobTypes: TBlpJobType[] | null;
  iterations: TBlpIteration[] | null;
  selectedJobType: TBlpJobType | null;
  selectedIteration: TBlpIteration | null;
  selectedProcess: TBlpTaskProcess | null;
  processes: TBlpTaskProcess[] | null;
  phases: TBlpTaskProcessPhase[] | null;
  updateUser: (user: TUserInfo | null) => void;
  updateSelectedProject: (project: TProjectTransformed | null) => void;
  updateSelectedCategory: (project: TRequirementCategory | null) => void;
  updateJobTypes: (jobTypes: TBlpJobType[] | null) => void;
  updateIterations: (iterations: TBlpIteration[] | null) => void;
  updateProcesses: (processes: TBlpTaskProcess[] | null) => void;
  updateSelectedJobType: (jobType: TBlpJobType | null) => void;
  updateSelectedIteration: (iteration: TBlpIteration | null) => void;
  updateSelectedProcess: (process: TBlpTaskProcess | null) => void;
  updateLoading: ({
    key,
    state,
  }: {
    key: keyof IBlpStore["loading"];
    state: boolean;
  }) => void;
  updateComCds: (comCds: TComCd[]) => void;
  updatePhases: (phases: TBlpTaskProcessPhase[] | null) => void;
  reset: () => void;
}

const defaultStates: Pick<
  IBlpStore,
  | "user"
  | "selectedProject"
  | "selectedCategory"
  | "comCds"
  | "jobTypes"
  | "iterations"
  | "selectedIteration"
  | "selectedJobType"
  | "processes"
  | "selectedProcess"
  | "phases"
  | "loading"
> = {
  user: null,
  selectedProject: null,
  selectedCategory: null,
  jobTypes: null,
  iterations: null,
  processes: null,
  phases: null,
  selectedJobType: null,
  selectedIteration: null,
  selectedProcess: null,
  comCds: null,
  loading: { taskRequireData: false, process: false, phases: false },
};

const useBlpStateBase = create<IBlpStore>()(
  persist(
    immer((set) => ({
      // values
      ...defaultStates,
      // actions
      updateUser: (user) => set({ user }),
      updateSelectedProject: (project) => set({ selectedProject: project }),
      updateSelectedCategory: (project) => set({ selectedCategory: project }),
      updateComCds: (comCds) => set({ comCds }),
      updateJobTypes: (jobTypes) => set({ jobTypes }),
      updateIterations: (iterations) => set({ iterations }),
      updateSelectedJobType: (jobType) => set({ selectedJobType: jobType }),
      updateSelectedIteration: (iteration) =>
        set({ selectedIteration: iteration }),
      updateProcesses: (processes) => set({ processes }),
      updateSelectedProcess: (process) => set({ selectedProcess: process }),
      updatePhases: (phases) => set({ phases }),
      updateLoading: ({ key, state }) =>
        set((s) => {
          s.loading[key] = state;
        }),
      // reset
      reset: () => set(defaultStates),
    })),
    {
      name: "blueprint-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
export const useBlpStore = createSelectorHooks(useBlpStateBase);
