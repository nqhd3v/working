import { useDataOptions } from "@/hooks/use-data-options";
import { useBlpStore } from "@/stores/blueprint";
import { getBlpProcessByIterations } from "@/utils/blp.request";
import { TBlpIteration, TBlpTaskProcess } from "@nqhd3v/crazy/types/blueprint";
import { Select, SelectProps } from "antd";
import { useEffect } from "react";

const SelectProcess: React.FC<
  Omit<SelectProps, "value" | "onChange" | "options"> & {
    onChange?: (process: TBlpTaskProcess) => void;
    value?: TBlpTaskProcess;
    iterationId?: TBlpIteration["itrtnId"];
  }
> = ({ iterationId, value, onChange, ...props }) => {
  const processes = useBlpStore.useProcesses();
  const project = useBlpStore.useSelectedProject();
  const loading = useBlpStore.useLoading().process;
  const setLoading = useBlpStore.useUpdateLoading();
  const setProcesses = useBlpStore.useUpdateProcesses();
  const { dic, options } = useDataOptions<TBlpTaskProcess>(
    processes,
    "bizProcId",
    "bizProcNm"
  );

  useEffect(() => {
    if (iterationId && project) {
      getBlpProcessByIterations({
        projectId: project.id,
        iterationId,
        onData: setProcesses,
        onLoading: setLoading("process"),
      });
    }
  }, [iterationId]);

  return (
    <Select
      placeholder="process"
      {...props}
      value={value?.bizProcId}
      loading={loading || props.loading}
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
