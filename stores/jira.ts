import {
  TBoardJira,
  TJiraIssueType,
  TSprintJira,
  TUserJira,
} from "@nqhd3v/crazy/types/jira";
import { createSelectorHooks } from "auto-zustand-selectors-hook";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export interface IJiraStore {
  user: TUserJira | null;
  selectedBoard: TBoardJira | null;
  selectedIssueTypes: TJiraIssueType[] | null;
  selectedSprint: TSprintJira | null;
  sprints: TSprintJira[] | null;
  loading: {
    sprints: boolean;
  };
  updateUser: (user: TUserJira | null) => void;
  updateSelectedBoard: (board: TBoardJira | null) => void;
  updateSelectedIssueTypes: (types: TJiraIssueType[] | null) => void;
  updateSprints: (sprints: TSprintJira[] | null) => void;
  updateSelectedSprint: (sprint: TSprintJira | null) => void;
  updateLoadingSprints: (loading: boolean) => void;
  reset: () => void;
}
const defaultStates: Pick<
  IJiraStore,
  | "user"
  | "selectedBoard"
  | "selectedIssueTypes"
  | "sprints"
  | "selectedSprint"
  | "loading"
> = {
  user: null,
  loading: {
    sprints: false,
  },
  selectedBoard: null,
  selectedIssueTypes: null,
  sprints: null,
  selectedSprint: null,
};
const useJiraStoreBase = create<IJiraStore>()(
  persist(
    immer((set) => ({
      // values
      ...defaultStates,
      // actions
      updateUser: (user) => set({ user }),
      updateSelectedBoard: (board) => set({ selectedBoard: board }),
      updateSelectedIssueTypes: (issueTypes) =>
        set({ selectedIssueTypes: issueTypes }),
      updateSprints: (sprints) => set({ sprints }),
      updateSelectedSprint: (sprint) => set({ selectedSprint: sprint }),
      updateLoadingSprints: (loading) =>
        set((state) => {
          state.loading.sprints = loading;
        }),
      // reset
      reset: () => set(defaultStates),
    })),
    {
      name: "jira-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
export const useJiraStore = createSelectorHooks(useJiraStoreBase);