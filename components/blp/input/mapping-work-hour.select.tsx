import { calculateWorkHrs } from "@/utils/blp.request";
import { Select, SelectProps } from "antd";
import { useMemo } from "react";
import { twMerge } from "tailwind-merge";

const generateExCases = (standard: number) => {
  return [Math.floor(standard / 2), Math.ceil(standard + 1)];
};

const SelectMappingWorkHours: React.FC<
  Omit<SelectProps, "options"> & { jiraWorkHour: number }
> = ({ jiraWorkHour, ...props }) => {
  const [case1, case2] = useMemo(
    () => generateExCases(jiraWorkHour),
    [jiraWorkHour]
  );

  return (
    <>
      <Select
        {...props}
        disabled={!jiraWorkHour}
        options={[
          {
            label: "always keep origin",
            value: "origin",
          },
          {
            label: (
              <>
                calculated based on the ratio between{" "}
                <span className="font-bold">{jiraWorkHour} (jira)</span> and{" "}
                <span className="font-bold">8 (blp)</span>
              </>
            ),
            value: "ratio",
          },
          {
            label: (
              <>
                {"keep origin if smaller than "}
                <span className="font-bold">{jiraWorkHour}h</span>
                {" and add more base on  "}
                <span className="font-bold">(work-hour - {jiraWorkHour})</span>
              </>
            ),
            value: "smaller:origin;greater:add",
          },
        ]}
        className={twMerge("!mb-1", props.className)}
      />
      {!!jiraWorkHour && (
        <div className="text-gray-400 text-xs">
          <div className="font-bold">Example:</div>
          <div>
            - If you logged {case1}h on Jira, it will be{" "}
            {calculateWorkHrs(props.value, case1, jiraWorkHour)}h on Blueprint
          </div>
          <div>
            - If you logged {case2}h on Jira, it will be{" "}
            {calculateWorkHrs(props.value, case2, jiraWorkHour)}h on Blueprint
          </div>
        </div>
      )}
    </>
  );
};

export default SelectMappingWorkHours;
