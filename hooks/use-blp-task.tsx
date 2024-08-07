import { getTaskJobs } from "@/app/actions/blueprint";
import { useBlpStore } from "@/stores/blueprint";
import { notification } from "antd";

export const useBlueprintTask = () => {
  const project = useBlpStore.useSelectedProject();

  const handleGetTaskJobs = async ({
    taskId,
    showNotification,
  }: {
    taskId: string;
    showNotification?: boolean;
  }) => {
    if (!project) {
      showNotification &&
        notification.error({
          message: "missed configuration!",
          description: "you need to configure Blueprint first!",
        });
      return null;
    }

    const result = await getTaskJobs(taskId, project.id);
    if (result.error || !result.data) {
      showNotification &&
        notification.error({
          message: "somethings went wrong",
          description: result.error || "unknown error!",
        });
      return null;
    }

    return result.data;
  };

  return {
    getJobs: handleGetTaskJobs,
  };
};
