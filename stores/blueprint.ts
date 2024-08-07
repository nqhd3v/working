import {
  TBlpIteration,
  TBlpJobType,
  TBlpTask,
  TBlpTaskDetails,
  TBlpTaskProcess,
  TBlpTaskProcessPhase,
  TComCd,
  TComCdTransformed,
  TProjectTransformed,
  TRequirementCategory,
  TUserInfo,
} from "@nqhd3v/crazy/types/blueprint";
import { create } from "zustand";
import { createSelectorHooks } from "auto-zustand-selectors-hook";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import {
  TBlpAssignerByPhase,
  TMappingWorkHourCase,
  TPhaseTransformed,
} from "@/types/blp";
import { EJiraIssueField } from "@/components/blp/input/task-conf-title.select";

export type TConfForInitTask = {
  jobType: TBlpJobType;
  iteration: TBlpIteration;
  process: TBlpTaskProcess;
};
export type TConfForRegTask = {
  assignerByPhase: TBlpAssignerByPhase[];
  title: string[];
  jiraWorkHours: number;
  mappingJiraWorkHoursCase: TMappingWorkHourCase;
};

interface IBlpStore {
  user: TUserInfo | null;
  loading: {
    taskRequireData: boolean;
    process: boolean;
    phases: boolean;
  };
  tasks: TBlpTask[] | null;
  selectedProject: TProjectTransformed | null;
  selectedCategory: TRequirementCategory | null;
  comCds: TComCdTransformed[] | null;
  jobTypes: TBlpJobType[] | null;
  iterations: TBlpIteration[] | null;
  selectedJobType: TBlpJobType | null;
  selectedIteration: TBlpIteration | null;
  selectedProcess: TBlpTaskProcess | null;
  processes: TBlpTaskProcess[] | null;
  phases: TBlpTaskProcessPhase[] | null;
  phasesForConf: TPhaseTransformed[] | null;
  confForInitTask: TConfForInitTask | null;
  confForRegTask: TConfForRegTask | null;
  pageURL: string | null;
  updateUser: (user: TUserInfo | null) => void;
  updateSelectedProject: (project: TProjectTransformed | null) => void;
  updateSelectedCategory: (project: TRequirementCategory | null) => void;
  updateJobTypes: (jobTypes: TBlpJobType[] | null) => void;
  updateIterations: (iterations: TBlpIteration[] | null) => void;
  updateProcesses: (processes: TBlpTaskProcess[] | null) => void;
  updateSelectedJobType: (jobType: TBlpJobType | null) => void;
  updateSelectedIteration: (iteration: TBlpIteration | null) => void;
  updateSelectedProcess: (process: TBlpTaskProcess | null) => void;
  updateConfForInitTask: (conf: TConfForInitTask | null) => void;
  updateConfForRegTask: (conf: TConfForRegTask | null) => void;
  updateLoading: (
    key: keyof IBlpStore["loading"]
  ) => (loading: boolean) => void;
  updateComCds: (comCds: TComCdTransformed[]) => void;
  updatePageURL: (pageURL: string | null) => void;
  updatePhases: (
    phases: TBlpTaskProcessPhase[] | TPhaseTransformed[] | null,
    forConf?: boolean
  ) => void;
  updateTasks: (tasks: TBlpTask[] | null) => void;
  reset: () => void;
}

export const DEFAULT_CONF_REG_TASK: {
  title: string[];
  jiraWorkHours: number;
  mappingJiraWorkHoursCase: TMappingWorkHourCase;
} = {
  title: [EJiraIssueField.KEY, " - ", EJiraIssueField.SUMMARY],
  jiraWorkHours: 8,
  mappingJiraWorkHoursCase: "smaller:origin;greater:add",
};

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
  | "phasesForConf"
  | "loading"
  | "confForInitTask"
  | "confForRegTask"
  | "pageURL"
  | "tasks"
> = {
  user: null,
  tasks: null,
  selectedProject: null,
  selectedCategory: null,
  jobTypes: null,
  iterations: null,
  processes: null,
  phases: null,
  phasesForConf: null,
  selectedJobType: null,
  selectedIteration: null,
  selectedProcess: null,
  confForInitTask: null,
  confForRegTask: null,
  comCds: null,
  pageURL: null,
  loading: { taskRequireData: false, process: false, phases: false },
};

const useBlpStateBase = create<IBlpStore>()(
  persist(
    immer((set, get) => ({
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
      updatePageURL: (pageURL) => set({ pageURL }),
      updatePhases: (phases, forConf) =>
        set((s) => {
          s[forConf ? "phasesForConf" : "phases"] = phases as any;
        }),
      updateLoading: (key) => (loading) =>
        set((s) => {
          s.loading[key] = loading;
        }),
      updateConfForInitTask: (conf) =>
        set((s) => {
          s.confForInitTask = conf;
        }),
      updateConfForRegTask: (conf) =>
        set((s) => {
          s.confForRegTask = conf;
        }),
      updateTasks: (tasks) => set({ tasks }),
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
