import {
  addWorklog,
  createTask,
  getTaskJobs,
  getTasksByJob,
  removeWorklog,
} from "@/app/actions/blueprint";
import { useBlpStore } from "@/stores/blueprint";
import { BLP_REQUIREMENT_STATE_START_WITH } from "@/utils/constant";
import { htmlToText } from "@/utils/mapping-data";
import {
  TBlpNewTaskResponse,
  TBlpTaskEffort,
  TBlpTaskJob,
  TBlpUserRole,
} from "@nqhd3v/crazy/types/blueprint";
import { notification } from "antd";
import { useEffect } from "react";
import { callMultiActions } from "./use-settle";
import { TJiraIssueType } from "@nqhd3v/crazy/types/jira";

export const useBlueprintTasks = ({ autoRun }: { autoRun?: boolean } = {}) => {
  const pageURL = useBlpStore.usePageURL();
  const project = useBlpStore.useSelectedProject();
  const category = useBlpStore.useSelectedCategory();
  const confTaskByIssueType = useBlpStore.useConfPhaseAssignerByIssueType();
  const confTaskSprintTasks = useBlpStore.useConfPhaseAssignerSprintTasks();

  const regTaskConf = useBlpStore.useConfForRegTask();
  const comCodes = useBlpStore.useComCds() || [];
  const tasks = useBlpStore.useTasks() || [];
  const setTasks = useBlpStore.useUpdateTasks();
  const setTaskJobs = useBlpStore.useUpdateTaskJobs();
  const setLoading = useBlpStore.useUpdateLoading();

  const handleGetTasks = async ({
    showNotification,
  }: { showNotification?: boolean } = {}) => {
    if (!pageURL || !category || !comCodes) {
      showNotification &&
        notification.error({
          message:
            "You need to set up Blueprint account & init for task first!",
        });
      return;
    }
    setLoading("tasks")(true);
    const tasks = await getTasksByJob(pageURL, {
      projectId: category.pjtId,
      jobCode: "all",
      states: comCodes
        .filter((c) => c.key.startsWith(BLP_REQUIREMENT_STATE_START_WITH))
        .map((c) => c.key),
    });

    if (tasks.error || tasks.data === null) {
      showNotification &&
        notification.error({ message: tasks.error || "no tasks found" });
      setLoading("tasks")(false);
      return;
    }

    setTasks(tasks.data);
    setLoading("tasks")(false);
  };

  const handleGetTaskJobs = async ({
    taskId,
    showNotification,
  }: {
    taskId: string;
    showNotification?: boolean;
  }) => {
    if (!pageURL || !category || !comCodes) {
      showNotification &&
        notification.error({
          message:
            "You need to set up Blueprint account & init for task first!",
        });
      return;
    }
    setLoading("taskJobs")(true);
    const jobs = await getTaskJobs(taskId, category.pjtId);

    if (jobs.error || jobs.data === null) {
      showNotification &&
        notification.error({ message: jobs.error || "no tasks found" });
      setLoading("tasks")(false);
      return;
    }

    setTaskJobs(jobs.data || null);
    setLoading("taskJobs")(false);
  };

  const handleCreateTask = async ({
    title,
    description,
    showNotification,
    issueType,
    forSprintTasks,
  }: {
    title: string;
    description: string;
    showNotification?: boolean;
    issueType?: TJiraIssueType;
    forSprintTasks?: boolean;
  }): Promise<TBlpNewTaskResponse | null> => {
    if ((!issueType && !forSprintTasks) || (issueType && forSprintTasks)) {
      console.error(
        "Unknown action! Please add once of type for this action (issueType or forSprintTasks only)"
      );
      notification.error({
        message: "Client error!",
        description: "Unknown action for creating a new task!",
      });
      return null;
    }
    if (
      !project ||
      !category ||
      !confTaskSprintTasks ||
      !confTaskByIssueType ||
      (issueType && !confTaskByIssueType[issueType.id]) ||
      !regTaskConf
    ) {
      showNotification &&
        notification.error({
          message: "Please configure before Create your task!",
        });
      return null;
    }
    const confForTask = forSprintTasks
      ? confTaskSprintTasks
      : confTaskByIssueType[(issueType as TJiraIssueType).id];

    const result = await createTask(
      {
        project,
        category,
        jobType: {
          code: confForTask.base.jobType.comCd,
          name: confForTask.base.jobType.cdNm,
        },
        process: {
          id: confForTask.base.process.bizProcId,
          name: confForTask.base.process.bizProcNm,
        },
        iterationId: confForTask.base.iteration.itrtnId,
        phasesWithAssigner: confForTask.phases.reduce(
          (res: Record<string, TBlpUserRole>, cur) => {
            if (res[cur.code]) return res;
            res[cur.code] = cur.assigners.find(
              (a) => a.usrId === cur.selected
            ) as TBlpUserRole;
            return res;
          },
          {}
        ),
      },
      {
        title,
        description: htmlToText(description),
        descriptionHTML: description,
      }
    );

    if (result.error || !result.data) {
      showNotification &&
        notification.error({
          message: "Create task failed!",
          description: result.error || "unknown error when create task!",
        });
      return null;
    }

    return result.data;
  };

  const handleAddWorklogs = async ({
    taskId,
    worklogs,
    job,
    showNotification,
  }: {
    taskId: string;
    worklogs: { date: string; mins: number }[];
    job?: TBlpTaskJob;
    showNotification?: boolean;
  }) => {
    if (!project || !category || !regTaskConf) {
      showNotification &&
        notification.error({
          message: "missed configuration!",
          description:
            "you need to configure for Blueprint task first to add worklogs!",
        });
      return null;
    }
    if (!regTaskConf.jobType && !job) {
      showNotification &&
        notification.error({
          message: "missed configuration!",
          description:
            "you need to configure task's job first to add worklogs!",
        });
      return null;
    }
    const payload = worklogs.map((log) => {
      return {
        params: [
          taskId,
          {
            date: log.date,
            mins: log.mins,
            job: {
              id: (job || regTaskConf.jobType).jbId,
              name: (job || regTaskConf.jobType).jbNm,
            },
          },
          {
            rootProjectId: project.id,
            projectId: category.prntPjtId,
          },
        ],
      };
    });
    const { rejectedData, resolvedData } = await callMultiActions(
      payload,
      addWorklog
    );

    if (rejectedData.length > 0) {
      showNotification &&
        notification.error({
          message: `Can not create timelog for ${rejectedData.length} items!`,
        });
      return null;
    }

    showNotification &&
      notification.success({
        message: `Created timelog for ${resolvedData.length} items!`,
      });
    console.info(`Add working-time for "${taskId}" result:`, {
      failed: rejectedData,
      success: resolvedData,
    });

    return {
      success: resolvedData,
      fail: rejectedData,
    };
  };

  const handleRemoveWorklogs = async ({
    taskId,
    efforts,
    showNotification,
  }: {
    taskId: string;
    efforts: TBlpTaskEffort[];
    showNotification?: boolean;
  }) => {
    if (!project || !category) {
      notification.error({
        message: "Missed configuration!",
        description: "you need to configure for Blueprint task first!",
      });
      return null;
    }
    const payload = efforts.map((effort) => {
      return {
        params: [
          taskId,
          effort,
          {
            rootProjectId: project.id,
            projectId: category.prntPjtId,
          },
        ],
      };
    });
    const { rejectedData, resolvedData } = await callMultiActions(
      payload,
      removeWorklog
    );

    if (rejectedData.length > 0) {
      showNotification &&
        notification.error({
          message: `Can not delete timelog for ${rejectedData.length} items!`,
        });
    }

    showNotification &&
      notification.success({
        message: `Deleted timelog for ${resolvedData.length} items!`,
      });
    console.info(`Delete working-time for "${taskId}" result:`, {
      failed: rejectedData,
      success: resolvedData,
    });

    return {
      success: resolvedData,
      fail: rejectedData,
    };
  };

  useEffect(() => {
    if (!autoRun || !pageURL || !category || !comCodes) return;

    handleGetTasks();
  }, [pageURL === null, category === null, comCodes === null]);

  return {
    tasks,
    getTasks: handleGetTasks,
    getTaskJobs: handleGetTaskJobs,
    createTask: handleCreateTask,
    addWorklogs: handleAddWorklogs,
    removeWorklogs: handleRemoveWorklogs,
  };
};
