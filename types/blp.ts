import {
  TBlpTaskDetails,
  TBlpTaskEffort,
  TBlpTaskProcessPhase,
  TBlpUserRole,
} from "@nqhd3v/crazy/types/blueprint";

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
