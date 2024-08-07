import {
  TRequestDataCallback,
  TRequestDefaultParams,
  TRequestOnLoading,
} from "@/types";
import { $client } from "./request";
import {
  TBlpIteration,
  TBlpJobType,
  TBlpTaskProcess,
  TBlpTaskProcessPhase,
  TBlpUserRole,
  TProjectTransformed,
  TRequestPhase,
  TRequirementCategory,
} from "@nqhd3v/crazy/types/blueprint";
import { TMappingWorkHourCase, TPhaseTransformed } from "@/types/blp";

export const getBlpRequireDataForCreateTask = async ({
  projectId,
  subProjectId,
  onData,
  onLoading,
}: TRequestDefaultParams<{
  jobTypes: TBlpJobType[];
  iterations: TBlpIteration[];
}> & {
  projectId: string;
  subProjectId: string;
}) => {
  try {
    onLoading?.(true);
    const res = await $client<{
      jobTypes: TBlpJobType[];
      iterations: TBlpIteration[];
    }>(`blp/projects/${projectId}/tasks/info`, {
      params: { subProjectId },
    });
    if (
      !Array.isArray(res.data.jobTypes) ||
      !Array.isArray(res.data.iterations)
    ) {
      return;
    }

    await onData(res.data);
  } catch (e) {
  } finally {
    onLoading?.(false);
  }
};

export const getTaskLink = (pageURL: string, taskId: string) =>
  `https://blueprint.cyberlogitec.com.vn/${pageURL}_1/${taskId}`;

export const getBlpProcessByIterations = async ({
  projectId,
  iterationId,
  onData,
  onLoading,
}: TRequestDefaultParams<TBlpTaskProcess[]> & {
  projectId: string;
  iterationId: string;
}) => {
  try {
    onLoading?.(true);
    const res = await $client<{ processes: TBlpTaskProcess[] }>(
      `blp/projects/${projectId}/tasks/processes`,
      {
        params: { iterationId },
      }
    );
    if (!Array.isArray(res.data.processes)) return;

    onData(res.data.processes);
  } catch (e) {
  } finally {
    onLoading?.(false);
  }
};

export const getBlpProcessPhasesByProcess = async <
  T extends TBlpTaskProcessPhase | TPhaseTransformed
>({
  projectId,
  iterationId,
  subProjectId,
  processId,
  forConf = true,
  onData,
  onLoading,
}: TRequestDefaultParams<T[]> & {
  projectId: string;
  subProjectId: string;
  iterationId: string;
  processId: string;
  forConf?: boolean;
}) => {
  try {
    onLoading?.(true);
    const res = await $client<{ phases: T[] }>(
      `blp/projects/${projectId}/tasks/processes/${processId}/${
        forConf ? "phases-for-conf" : "phases"
      }`,
      {
        params: { iterationId, subProjectId },
      }
    );
    if (!Array.isArray(res.data.phases)) return;

    onData(res.data.phases);
  } catch (e) {
  } finally {
    onLoading?.(false);
  }
};

export const createBlpTask = async ({
  iteration,
  category,
  jobType,
  process,
  onData,
  onLoading,
  ...payload
}: TRequestDefaultParams<any> & {
  project: TProjectTransformed;
  category: TRequirementCategory;
  jobType: TBlpJobType;
  iteration: TBlpIteration;
  phasesWithAssigner: Record<TBlpTaskProcessPhase["phsCd"], TBlpUserRole>;
  process: TBlpTaskProcess;
  title: string;
  description: string;
  descriptionHTML: string;
}) => {
  try {
    onLoading?.(true);
    const res = await $client.post<{ payload: any }>(`blp/tasks`, {
      category,
      jobType: {
        code: jobType.comCd,
        name: jobType.cdNm,
      },
      process: {
        id: process.bizProcId,
        name: process.bizProcNm,
      },
      iterationId: iteration.itrtnId,
      ...payload,
    });
    if (!Array.isArray(res.data.payload)) return;

    onData(res.data.payload);
  } catch (e) {
  } finally {
    onLoading?.(false);
  }
};

export const calculateWorkHrs = (
  mappingCase: TMappingWorkHourCase,
  hour: number,
  standard: number
): number => {
  if (mappingCase === "origin") return hour;
  if (mappingCase === "ratio") return Math.round((hour / standard) * 80) / 10;
  // smaller:origin;greater:add
  if (hour < standard) return hour;
  return 8 + hour - standard;
};

export const phaseTransform = (
  phase: TBlpTaskProcessPhase
): TPhaseTransformed => ({
  code: phase.phsCd,
  name: phase.phsNm,
  assigners: phase.asgnList,
});
