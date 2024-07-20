import { useDataOptions } from "@/hooks/use-data-options";
import { useBlpStore } from "@/stores/blueprint";
import {
  TBlpTaskProcessPhase,
  TBlpUserRole,
} from "@nqhd3v/crazy/types/blueprint";
import { Select, SelectProps } from "antd";
import Image from "next/image";

export const PhaseAssign: React.FC<
  Omit<SelectProps, "value" | "options" | "onChange"> & {
    value?: TBlpTaskProcessPhase;
    onChange?: (phase: TBlpTaskProcessPhase) => void;
  }
> = ({ value, onChange, ...props }) => {
  const loading = useBlpStore.useLoading().phases;
  const { dic, options } = useDataOptions(value?.asgnList, "usrId", "usrNm");

  const handleAssignUsrForTask: SelectProps["onChange"] = (
    usrId: TBlpUserRole["usrId"]
  ) => {
    if (!value) return;

    const newValue: TBlpTaskProcessPhase = {
      ...value,
      usrId,
      usrNm: dic[usrId].usrNm,
    };
    onChange?.(newValue);
  };

  if (!value) return null;

  return (
    <div className="w-[280px] rounded bg-white relative flex items-center p-3 gap-3 border border-gray-100">
      <div className="w-16 h-16 relative rounded-full border border-gray-100 overflow-hidden">
        {(dic[value.usrId] as any)?.imgUrl && (
          <Image
            src={`https://blueprint.cyberlogitec.com.vn/${
              (dic[value.usrId] as any).imgUrl
            }`}
            fill
            alt="avatar"
          />
        )}
      </div>
      <div className="w-[calc(100%-64px)]">
        <div className="font-bold text-xs text-gray-400 uppercase mb-1">
          {value?.phsNm || "--"}
        </div>
        <Select
          placeholder="assigner"
          {...props}
          value={value.usrId}
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
