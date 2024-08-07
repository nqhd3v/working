import { InputNumber, InputNumberProps } from "antd";
import { twMerge } from "tailwind-merge";

const InputWorkHour: React.FC<InputNumberProps> = (props) => {
  return (
    <>
      <InputNumber
        {...props}
        placeholder="working-hours/day on Jira"
        prefix="8h ~ "
        className={twMerge("!mb-1 !w-full", props.className)}
        max={8}
        min={2}
      />
      <div className="text-gray-400 text-xs">
        On Blueprint, working hours (per day) is 8 hours, but with the different
        configuration on Jira (based on your team), it can be 6.5, or something
        different, so we need configure it to support you mapping your working
        time on Jira to Blueprint.
      </div>
    </>
  );
};

export default InputWorkHour;
