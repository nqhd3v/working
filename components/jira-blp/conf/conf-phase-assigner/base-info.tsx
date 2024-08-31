import { twMerge } from "tailwind-merge";
import SelectIteration from "../../../blp/input/iteration.select";
import SelectJobTypes from "../../../blp/input/job-type.select";
import SelectProcess from "../../../blp/input/process.select";
import {
  TNewTaskBaseInfoValues,
  TNewTaskBaseInfoValuesFullFilled,
} from "./types";

const NewTaskBaseInfo: React.FC<{
  value?: TNewTaskBaseInfoValues;
  onChange?: (value: TNewTaskBaseInfoValues) => void;
  onFullFilled?: (value: TNewTaskBaseInfoValuesFullFilled) => void;
  disabled?: boolean;
  className?: string;
}> = ({ value, className, disabled, onChange, onFullFilled }) => {
  const handleChange = (values: Partial<TNewTaskBaseInfoValues>) => {
    const allValues = { ...(value || {}), ...values };
    onChange?.(allValues);
    if (allValues.iteration && allValues.jobType && allValues.process) {
      onFullFilled?.(allValues as TNewTaskBaseInfoValuesFullFilled);
    }
  };

  return (
    <div className={twMerge("grid grid-cols-3 gap-3", className)}>
      <SelectJobTypes
        value={value?.jobType}
        onChange={(v) => handleChange({ jobType: v })}
        disabled={disabled}
      />
      <SelectIteration
        value={value?.iteration}
        onChange={(v) => handleChange({ iteration: v })}
        disabled={disabled}
      />
      <SelectProcess
        value={value?.process}
        onChange={(v) => handleChange({ process: v })}
        iterationId={value?.iteration?.itrtnId}
        disabled={disabled}
        global={false}
      />
    </div>
  );
};

export default NewTaskBaseInfo;
