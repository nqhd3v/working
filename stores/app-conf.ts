import { TJiraIssue } from "@nqhd3v/crazy/types/jira";
import { createSelectorHooks } from "auto-zustand-selectors-hook";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export interface IAppConfStore {
  sampleJiraIssue: TJiraIssue | null;
  updateSampleJiraIssue: (i: IAppConfStore["sampleJiraIssue"]) => void;
  reset: () => void;
}
const defaultStates: Pick<IAppConfStore, "sampleJiraIssue"> = {
  sampleJiraIssue: null,
};
const useAppConfStoreBase = create<IAppConfStore>()(
  persist(
    immer((set) => ({
      // values
      ...defaultStates,
      // actions
      updateSampleJiraIssue: (i) => set({ sampleJiraIssue: i }),
      // reset
      reset: () => set(defaultStates),
    })),
    {
      name: "app-conf-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
export const useAppConfStore = createSelectorHooks(useAppConfStoreBase);
