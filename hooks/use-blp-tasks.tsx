import {
  addWorklog,
  createTask,
  getTasksByJob,
  removeWorklog,
} from "@/app/actions/blueprint";
import { useBlpStore } from "@/stores/blueprint";
import { BLP_REQUIREMENT_STATE_START_WITH } from "@/utils/constant";
import { htmlToText } from "@/utils/mapping-data";
import {
  TBlpTaskEffort,
  TBlpTaskJob,
  TBlpUserRole,
} from "@nqhd3v/crazy/types/blueprint";
import { notification } from "antd";
import { useEffect } from "react";
import { callMultiActions } from "./use-settle";

export const useBlueprintTasks = ({ autoRun }: { autoRun?: boolean } = {}) => {
  const pageURL = useBlpStore.usePageURL();
  const project = useBlpStore.useSelectedProject();
  const category = useBlpStore.useSelectedCategory();
  const initTaskConf = useBlpStore.useConfForInitTask();
  const regTaskConf = useBlpStore.useConfForRegTask();
  const comCodes = useBlpStore.useComCds() || [];
  const tasks = useBlpStore.useTasks() || [];
  const setTasks = useBlpStore.useUpdateTasks();

  const handleGetTasks = async ({
    showNotification,
  }: { showNotification?: boolean } = {}) => {
    if (!pageURL || !category || !initTaskConf || !comCodes) {
      showNotification &&
        notification.error({
          message:
            "You need to set up Blueprint account & init for task first!",
        });
      return;
    }
    const tasks = await getTasksByJob(pageURL, {
      projectId: category.pjtId,
      jobCode: initTaskConf.jobType.comCd,
      states: comCodes
        .filter((c) => c.key.startsWith(BLP_REQUIREMENT_STATE_START_WITH))
        .map((c) => c.key),
    });

    if (tasks.error || tasks.data === null) {
      showNotification &&
        notification.error({ message: tasks.error || "no tasks found" });
      return;
    }

    setTasks(tasks.data);
  };

  const handleCreateTask = async ({
    title,
    description,
  }: {
    title: string;
    description: string;
  }) => {
    if (!project || !category || !initTaskConf || !regTaskConf) {
      notification.error({
        message: "Please configure before Create your task!",
      });
      return null;
    }

    const result = await createTask(
      {
        project,
        category,
        jobType: {
          code: initTaskConf.jobType.comCd,
          name: initTaskConf.jobType.cdNm,
        },
        process: {
          id: initTaskConf.process.bizProcId,
          name: initTaskConf.process.bizProcNm,
        },
        iterationId: initTaskConf.iteration.itrtnId,
        phasesWithAssigner: regTaskConf.assignerByPhase.reduce(
          (res: Record<string, TBlpUserRole>, cur) => {
            if (res[cur.code]) return res;
            res[cur.code] = cur.assigner;
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
    showNotification,
  }: {
    taskId: string;
    worklogs: { date: string; mins: number; job: TBlpTaskJob }[];
    showNotification?: boolean;
  }) => {
    if (!project || !category) {
      showNotification &&
        notification.error({
          message: "missed configuration!",
          description: "you need to configure for Blueprint task first!",
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
              id: log.job.jbId,
              name: log.job.jbNm,
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
    if (!autoRun || !pageURL || !category || !initTaskConf || !comCodes) return;

    handleGetTasks();
  }, [
    pageURL === null,
    initTaskConf === null,
    category === null,
    comCodes === null,
  ]);

  return {
    tasks,
    getTasks: handleGetTasks,
    createTask: handleCreateTask,
    addWorklogs: handleAddWorklogs,
    removeWorklogs: handleRemoveWorklogs,
  };
};