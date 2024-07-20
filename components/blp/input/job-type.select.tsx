import { useDataOptions } from "@/hooks/use-data-options";
import { useBlpStore } from "@/stores/blueprint";
import { TBlpJobType } from "@nqhd3v/crazy/types/blueprint";
import { Select, SelectProps } from "antd";

const SelectJobTypes: React.FC<
  Omit<SelectProps, "value" | "onChange" | "options"> & {
    onChange?: (job: TBlpJobType) => void;
    value?: TBlpJobType;
  }
> = ({ onChange, value, ...props }) => {
  const jobTypes = useBlpStore.useJobTypes();
  const loading = useBlpStore.useLoading().taskRequireData;
  const { dic, options } = useDataOptions<TBlpJobType>(
    jobTypes,
    "comCd",
    "cdNm"
  );

  return (
    <Select
      placeholder="job type"
      {...props}
      value={value?.comCd}
      loading={loading || props.loading}
      options={options}
      onChange={(jobCode) => onChange?.(dic[jobCode])}
      optionFilterProp="label"
      showSearch
    />
  );
};

export default SelectJobTypes;
