import { TJiraIssueType } from "@nqhd3v/crazy/types/jira";
import { TPhaseTransformed } from "@/types/blp";
import {
  TBlpIteration,
  TBlpJobType,
  TBlpTaskProcess,
} from "@nqhd3v/crazy/types/blueprint";

export type TConfPhaseAssigner = {
  info: TJiraIssueType;
  base: TNewTaskBaseInfoValues;
  phases: TPhaseTransformed[];
};

export type TNewTaskBaseInfoValues = {
  jobType?: TBlpJobType;
  iteration?: TBlpIteration;
  process?: TBlpTaskProcess;
};
export type TNewTaskBaseInfoValuesFullFilled = {
  jobType: TBlpJobType;
  iteration: TBlpIteration;
  process: TBlpTaskProcess;
};
