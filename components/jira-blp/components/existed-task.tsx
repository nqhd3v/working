import { getTaskById } from "@/app/actions/blueprint";
import {
  TBlpTask,
  TBlpTaskDetails,
  TBlpTaskEffort,
} from "@nqhd3v/crazy/types/blueprint";
import { useSetState } from "ahooks";
import { Alert, Button } from "antd";

const ExistedTask: React.FC<{
  task?: TBlpTask | null;
  onGetTask?: (task: TBlpTaskDetails & { worklogs: TBlpTaskEffort[] }) => void;
}> = ({ task, onGetTask }) => {
  const [{ loading, taskDetails }, setState] = useSetState<{
    loading: boolean;
    taskDetails: TBlpTaskDetails | null;
  }>({ loading: false, taskDetails: null });

  if (!task) return null;
  const getTaskDetails = async () => {
    if (loading) return;
    setState({ loading: true });
    const result = await getTaskById(task.reqId);

    if (result.error || !result.data) {
      setState({ loading: false });
      return;
    }

    onGetTask?.(result.data);
    setState({ loading: false, taskDetails: result.data });
  };

  if (taskDetails) {
    console.log(taskDetails);
    return (
      <div className="p-3 rounded bg-gray-100 text-gray-500">
        <div className="text-xs mb-1">blueprint task</div>
        <div className="font-bold mb-3">{taskDetails.reqTitNm}</div>

        <div className="text-xs mb-1">current phase</div>
        <div className="font-bold">
          {taskDetails.phsNm} - ({taskDetails.usrId})
        </div>
      </div>
    );
  }

  return (
    <Alert
      type="warning"
      showIcon
      className="!mb-5"
      action={
        <Button onClick={() => getTaskDetails()} loading={loading}>
          check
        </Button>
      }
      message="it looks like you created a task for this on Blueprint!"
    />
  );
};

export default ExistedTask;
