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
} from "@nqhd3v/crazy/types/blueprint";

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

export const getBlpProcessPhasesByProcess = async ({
  projectId,
  iterationId,
  subProjectId,
  processId,
  onData,
  onLoading,
}: TRequestDefaultParams<TBlpTaskProcessPhase[]> & {
  projectId: string;
  subProjectId: string;
  iterationId: string;
  processId: string;
}) => {
  try {
    onLoading?.(true);
    const res = await $client<{ phases: TBlpTaskProcessPhase[] }>(
      `blp/projects/${projectId}/tasks/processes/${processId}/phases`,
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
