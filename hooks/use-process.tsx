import {
  CheckCircleFilled,
  ExclamationCircleFilled,
  Loading3QuartersOutlined,
} from "@ant-design/icons";
import { useState } from "react";

export type TProcessState = "loading" | "error" | "done";
export type TSetProcessState = (state: TProcessState) => (msg: string) => void;
const useProcess = (): {
  content: React.ReactNode;
  state: { state: TProcessState; message: string } | null;
  setState: TSetProcessState;
} => {
  const [state, setState] = useState<{
    state: TProcessState;
    message: string;
  } | null>(null);
  const iconByState: Record<TProcessState, React.ReactNode> = {
    done: <CheckCircleFilled />,
    error: <ExclamationCircleFilled />,
    loading: <Loading3QuartersOutlined spin />,
  };
  const displayContent = state ? (
    <div className="flex gap-2 items-center">
      {iconByState[state.state]}
      <span>{state.message}</span>
    </div>
  ) : null;

  return {
    content: displayContent,
    state,
    setState: (state: TProcessState) => (message: string) =>
      setState({ state, message }),
  };
};

export default useProcess;
