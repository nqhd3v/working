import {
  TNewTaskBaseInfoValues,
  TNewTaskBaseInfoValuesFullFilled,
} from "@/components/jira-blp/conf/conf-phase-assigner/types";
import {
  TBlpTaskDetails,
  TBlpTaskEffort,
  TBlpTaskProcessPhase,
  TBlpUserRole,
} from "@nqhd3v/crazy/types/blueprint";
import { TJiraIssueType } from "@nqhd3v/crazy/types/jira";

export type TPhaseTransformed = {
  code: TBlpTaskProcessPhase["phsCd"];
  name: TBlpTaskProcessPhase["phsNm"];
  assigners: TBlpTaskProcessPhase["asgnList"];
  selected?: TBlpTaskProcessPhase["usrId"];
};

export type TMappingWorkHourCase =
  | "ratio"
  | "origin"
  | "smaller:origin;greater:add";

export type TBlpAssignerByPhase = {
  code: TPhaseTransformed["code"];
  assigner: TBlpUserRole;
};

export type TTaskDetail = TBlpTaskDetails & { worklogs: TBlpTaskEffort[] };

export type TConfPhaseAssignerValue = {
  base: TNewTaskBaseInfoValuesFullFilled;
  phases: TPhaseTransformed[];
};
export type TConfPhaseAssignerByIssueType = Record<
  TJiraIssueType["id"],
  TConfPhaseAssignerValue
>;
