import { TPhaseTransformed } from "@/types/blp";
import { TConfPhaseAssigner } from "./types";

export const isMissConfPhaseAssigner = (
  phases?: TPhaseTransformed[]
): boolean => {
  if (!Array.isArray(phases) || phases.length === 0) return true;

  return !!phases.find((phase) => !phase.selected);
};

export const isMissConfSprintTasksPhaseAssigner = (
  sprintTasks?: Omit<TConfPhaseAssigner, "info">
): boolean => {
  return !sprintTasks || isMissConfPhaseAssigner(sprintTasks.phases);
};

export const isMissConfIssueTypePhaseAssigner = (
  confByIssueTypes?: TConfPhaseAssigner[]
): boolean => {
  if (!Array.isArray(confByIssueTypes) || confByIssueTypes.length === 0)
    return true;

  return !!confByIssueTypes.find((issueType) =>
    isMissConfPhaseAssigner(issueType.phases)
  );
};
