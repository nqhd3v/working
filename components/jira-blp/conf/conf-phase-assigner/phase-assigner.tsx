import { useDataOptions } from "@/hooks/use-data-options";
import { useBlpStore } from "@/stores/blueprint";
import { TPhaseTransformed } from "@/types/blp";
import { TBlpUserRole } from "@nqhd3v/crazy/types/blueprint";
import { Form, Image, Select, SelectProps, Skeleton } from "antd";
import React from "react";
import { NamePath } from "antd/es/form/interface";

const PhaseAssigners: React.FC<{
  name: NamePath;
}> = ({ name }) => {
  return (
    <Form.List name={[name, "phases"]}>
      {(fields) => {
        if (!Array.isArray(fields) || fields.length === 0) {
          return (
            <div className="flex gap-3">
              <PhaseAssignPreview />
              <PhaseAssignPreview />
              <PhaseAssignPreview />
            </div>
          );
        }

        return (
          <div className="flex gap-3 max-w-full overflow-x-auto overflow-y-hidden">
            {fields.map((field) => (
              <Form.Item
                {...field}
                key={field.key}
                className="!mb-0"
                rules={[
                  () => ({
                    validator: (_, value) => {
                      if (!value || !value.selected) return Promise.reject("");
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <PhaseAssign />
              </Form.Item>
            ))}
          </div>
        );
      }}
    </Form.List>
  );
};

const PhaseAssign: React.FC<
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
    <div className="w-64 rounded bg-white relative flex items-center p-3 gap-3 border border-gray-200">
      <div className="w-10 h-10 relative rounded-full border border-gray-100 overflow-hidden">
        {value.selected && (dic[value.selected] as any)?.imgUrl && (
          <img
            src={`https://blueprint.cyberlogitec.com.vn/${
              (dic[value.selected] as any).imgUrl
            }`}
            className="absolute w-full h-auto"
            alt="avatar"
          />
        )}
      </div>
      <div className="w-[calc(100%-40px)]">
        <div className="font-bold text-xs text-gray-400 uppercase mb-1">
          {value.name || "--"}
        </div>
        <Select
          placeholder="assigner"
          size="small"
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

const PhaseAssignPreview = () => {
  return (
    <div className="w-64 rounded bg-white relative flex items-center p-3 gap-3 border border-gray-200">
      <Skeleton.Avatar />
      <div className="w-[calc(100%-64px)]">
        <Skeleton title={{ width: 120 }} paragraph={false} className="mb-1" />
        <Skeleton.Input />
      </div>
    </div>
  );
};

export default PhaseAssigners;
