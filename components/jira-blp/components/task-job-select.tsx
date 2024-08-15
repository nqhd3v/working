import { useBlueprintTasks } from "@/hooks/use-blp-tasks";
import { useBlpStore } from "@/stores/blueprint";
import { TBlpTaskJob } from "@nqhd3v/crazy/types/blueprint";
import { Select, SelectProps } from "antd";
import { useEffect } from "react";

const TaskJobSelector: React.FC<
  Omit<SelectProps, "value" | "onChange" | "options"> & {
    value?: TBlpTaskJob;
    onChange?: (value: TBlpTaskJob | undefined) => void;
  }
> = ({ value, onChange, ...props }) => {
  const { tasks: loadingTasks, taskJobs: loadingTaskJobs } =
    useBlpStore.useLoading();
  const taskJobs = useBlpStore.useTaskJobs();
  const { tasks, getTaskJobs } = useBlueprintTasks();

  useEffect(() => {
    if (!tasks || tasks.length === 0 || (taskJobs && taskJobs.length > 0)) {
      return;
    }

    const sampleTask = tasks[0];
    getTaskJobs({ taskId: sampleTask.reqId });
  }, [(tasks || []).length]);

  const handlePickJob = (jobId: string) => {
    const job = (taskJobs || []).find((j) => j.jbId === jobId);
    onChange?.(job);
  };

  return (
    <Select
      {...props}
      value={value?.jbId}
      onChange={handlePickJob}
      disabled={!tasks || !taskJobs || taskJobs.length === 0}
      options={(taskJobs || []).map((j) => ({ label: j.jbNm, value: j.jbId }))}
      loading={loadingTaskJobs || loadingTasks}
    />
  );
};

export default TaskJobSelector;
