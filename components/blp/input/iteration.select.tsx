import { useDataOptions } from "@/hooks/use-data-options";
import { useBlpStore } from "@/stores/blueprint";
import { TBlpIteration } from "@nqhd3v/crazy/types/blueprint";
import { Select, SelectProps } from "antd";

const SelectIteration: React.FC<
  Omit<SelectProps, "value" | "onChange" | "options"> & {
    onChange?: (iteration: TBlpIteration) => void;
    value?: TBlpIteration;
  }
> = ({ onChange, value, ...props }) => {
  const iterations = useBlpStore.useIterations();
  const loading = useBlpStore.useLoading().taskRequireData;
  const { dic, options } = useDataOptions<TBlpIteration>(
    iterations,
    "itrtnId",
    "itrtnNm"
  );

  return (
    <Select
      placeholder="iteration"
      {...props}
      value={value?.itrtnId}
      loading={loading || props.loading}
      options={options}
      onChange={(iterationId) => {
        onChange?.(dic[iterationId]);
      }}
    />
  );
};

export default SelectIteration;
