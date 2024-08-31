import { useDataOptions } from "@/hooks/use-data-options";
import { TProcessState } from "@/hooks/use-process";
import { useBlpStore } from "@/stores/blueprint";
import { getBlpProcessByIterations } from "@/utils/blp.request";
import { TBlpIteration, TBlpTaskProcess } from "@nqhd3v/crazy/types/blueprint";
import { Select, SelectProps } from "antd";
import { useEffect, useState } from "react";

const SelectProcess: React.FC<
  Omit<SelectProps, "value" | "onChange" | "options"> & {
    onChange?: (process: TBlpTaskProcess) => void;
    value?: TBlpTaskProcess;
    iterationId?: TBlpIteration["itrtnId"];
    global?: boolean;
  }
> = ({ iterationId, value, global = true, onChange, ...props }) => {
  const [localProcesses, setLocalProcesses] = useState<TBlpTaskProcess[]>([]);
  const [localLoading, setLocalLoading] = useState(false);
  const processes = useBlpStore.useProcesses();
  const project = useBlpStore.useSelectedProject();
  const loading = useBlpStore.useLoading().process;
  const setLoading = useBlpStore.useUpdateLoading();
  const setProcesses = useBlpStore.useUpdateProcesses();
  const { dic, options } = useDataOptions<TBlpTaskProcess>(
    global ? processes : localProcesses,
    "bizProcId",
    "bizProcNm"
  );

  useEffect(() => {
    if (iterationId && project) {
      getBlpProcessByIterations({
        projectId: project.id,
        iterationId,
        onData: global ? setProcesses : setLocalProcesses,
        onLoading: global ? setLoading("process") : setLocalLoading,
      });
    }
  }, [iterationId]);

  return (
    <Select
      placeholder="process"
      {...props}
      value={value?.bizProcId}
      loading={loading || localLoading || props.loading}
      options={options}
      onChange={(processId) => {
        onChange?.(dic[processId]);
      }}
      optionFilterProp="label"
      showSearch
    />
  );
};

export default SelectProcess;
