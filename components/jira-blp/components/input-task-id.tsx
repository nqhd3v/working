import { getTaskById } from "@/app/actions/blueprint";
import { TTaskDetail } from "@/types/blp";
import { ExclamationCircleOutlined, LoadingOutlined } from "@ant-design/icons";
import { TBlpTaskDetails, TBlpTaskEffort } from "@nqhd3v/crazy/types/blueprint";
import { useSetState } from "ahooks";
import { Input, InputProps, Tooltip } from "antd";
import { FocusEventHandler } from "react";

export type TGetTaskHandler = (
  task: (TTaskDetail & { worklogs: TBlpTaskEffort[] }) | null
) => void;
const InputTaskId: React.FC<
  InputProps & {
    onGetTask?: TGetTaskHandler;
  }
> = ({ onGetTask, ...props }) => {
  const [{ task, error, loading }, setState] = useSetState<{
    task?: TBlpTaskDetails;
    error?: string;
    loading: boolean;
  }>({ loading: false });

  if (task) {
    return (
      <div className="p-3 bg-gray-100 rounded text-gray-600">
        <span className="text-xs opacity-70 block mb-1">Task:</span>
        <span className="leading-normal font-bold">{task.reqTitNm}</span>
      </div>
    );
  }
  const handleCheck: FocusEventHandler<HTMLInputElement> = async (e) => {
    const id = e.target.value as string;
    if (!id || id.trim() === "") {
      setState({ task: undefined, error: undefined });
      return;
    }
    setState({ loading: true });
    const taskDetails = await getTaskById(id);

    onGetTask?.(taskDetails.data || null);
    setState({
      task: taskDetails.data || undefined,
      error:
        taskDetails.error ||
        (taskDetails.data === null ? "no task found" : undefined),
      loading: false,
    });
  };

  return (
    <Input
      placeholder="Task ID"
      onBlur={handleCheck}
      {...props}
      disabled={loading}
      suffix={
        loading ? (
          <LoadingOutlined spin />
        ) : error ? (
          <Tooltip title={error}>
            <ExclamationCircleOutlined className="!text-red-400" />
          </Tooltip>
        ) : null
      }
    />
  );
};

export default InputTaskId;
