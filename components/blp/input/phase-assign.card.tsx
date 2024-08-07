import { useDataOptions } from "@/hooks/use-data-options";
import { useBlpStore } from "@/stores/blueprint";
import { TPhaseTransformed } from "@/types/blp";
import { TBlpUserRole } from "@nqhd3v/crazy/types/blueprint";
import { Select, SelectProps } from "antd";
import Image from "next/image";

export const PhaseAssign: React.FC<
  Omit<SelectProps, "value" | "options" | "onChange"> & {
    value?: TPhaseTransformed;
    onChange?: (phase: TPhaseTransformed) => void;
  }
> = ({ value, onChange, ...props }) => {
  const loading = useBlpStore.useLoading().phases;
  const { dic, options } = useDataOptions(value?.assigners, "usrId", "usrNm");

  const handleAssignUsrForTask: SelectProps["onChange"] = (
    usrId: TBlpUserRole["usrId"]
  ) => {
    if (!value) return;

    const newValue: TPhaseTransformed = {
      ...value,
      selected: usrId,
    };
    onChange?.(newValue);
  };

  if (!value) return null;

  return (
    <div className="w-[280px] rounded bg-white relative flex items-center p-3 gap-3 border border-gray-100">
      <div className="w-16 h-16 relative rounded-full border border-gray-100 overflow-hidden">
        {value.selected && (dic[value.selected] as any)?.imgUrl && (
          <Image
            src={`https://blueprint.cyberlogitec.com.vn/${
              (dic[value.selected] as any).imgUrl
            }`}
            fill
            alt="avatar"
          />
        )}
      </div>
      <div className="w-[calc(100%-64px)]">
        <div className="font-bold text-xs text-gray-400 uppercase mb-1">
          {value.name || "--"}
        </div>
        <Select
          placeholder="assigner"
          {...props}
          className={props.className}
          value={value.selected}
          loading={loading || props.loading}
          options={options}
          onChange={handleAssignUsrForTask}
          optionFilterProp="label"
          showSearch
        />
      </div>
    </div>
  );
};
