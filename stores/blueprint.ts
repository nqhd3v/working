import {
  TComCd,
  TProjectTransformed,
  TRequirementCategory,
  TUserInfo,
} from "@nqhd3v/crazy/types/blueprint";
import { create } from "zustand";
import { createSelectorHooks } from "auto-zustand-selectors-hook";
import { createJSONStorage, persist } from "zustand/middleware";

interface IBlpStore {
  user: TUserInfo | null;
  selectedProject: TProjectTransformed | null;
  selectedCategory: TRequirementCategory | null;
  comCds: TComCd[] | null;
  updateUser: (user: TUserInfo | null) => void;
  updateSelectedProject: (project: TProjectTransformed | null) => void;
  updateSelectedCategory: (project: TRequirementCategory | null) => void;
  updateComCds: (comCds: TComCd[]) => void;
  reset: () => void;
}

const defaultStates: Pick<
  IBlpStore,
  "user" | "selectedProject" | "selectedCategory" | "comCds"
> = {
  user: null,
  selectedProject: null,
  selectedCategory: null,
  comCds: null,
};

const useBlpStateBase = create<IBlpStore>()(
  persist(
    (set) => ({
      // values
      ...defaultStates,
      // actions
      updateUser: (user) => set({ user }),
      updateSelectedProject: (project) => set({ selectedProject: project }),
      updateSelectedCategory: (project) => set({ selectedCategory: project }),
      updateComCds: (comCds) => set({ comCds }),
      // reset
      reset: () => set(defaultStates),
    }),
    {
      name: "blueprint-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
export const useBlpStore = createSelectorHooks(useBlpStateBase);
