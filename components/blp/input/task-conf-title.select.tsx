import { useAppConfStore } from "@/stores/app-conf";
import { Select, SelectProps, Tag } from "antd";
import { DefaultOptionType } from "antd/es/select";
import { get } from "lodash";
import { twMerge } from "tailwind-merge";

export enum EJiraIssueField {
  KEY = "$.key",
  SUMMARY = "$.fields.summary",
  DESCRIPTION = "$.fields.description",
}
export type TSampleTitleField = {
  value: string;
  __variable: boolean;
};

const SampleBLPTitle: React.FC<{ fields?: string[] }> = ({ fields }) => {
  const sampleJiraIssue = useAppConfStore.useSampleJiraIssue();

  if (!sampleJiraIssue || !fields || fields.length === 0) {
    return (
      <div className="h-6 italic text-gray-400 text-xs flex items-center">
        Preview mode unavailable because no fields selected!
      </div>
    );
  }

  return (
    <div className="text-gray-400 text-xs h-6">
      <span className="text-gray-600 italic font-bold">Preview:</span>{" "}
      {fields.map((field, index) => (
        <span key={`eg-field-title-${index}`}>
          {field.startsWith("$.")
            ? get(sampleJiraIssue, field.replace("$.", ""))
            : field}
        </span>
      ))}
    </div>
  );
};

const TaskConfTittle: React.FC<
  Omit<SelectProps, "value" | "options" | "mode"> & { value?: string[] }
> = ({ value, onChange, ...props }) => {
  const handleChange = (value: string[], options: DefaultOptionType[]) => {
    onChange?.(value, options);
  };

  return (
    <>
      <Select
        {...props}
        className={twMerge("!mb-1", props.className)}
        onChange={(v, o) => handleChange(v, o as DefaultOptionType[])}
        value={value}
        tagRender={(props) => {
          return (
            <Tag
              {...props}
              className={twMerge(
                props.value?.startsWith("$.")
                  ? "font-bold text-gray-600"
                  : "text-gray-400"
              )}
              color={props.value?.startsWith("$.") ? "green" : "purple"}
            >
              {props.label}
            </Tag>
          );
        }}
        options={[
          {
            label: "<JIRA-ISSUE-KEY>",
            value: EJiraIssueField.KEY,
          },
          {
            label: "<JIRA-ISSUE-SUMMARY>",
            value: EJiraIssueField.SUMMARY,
          },
        ]}
        mode="tags"
      />
      <div className="text-xs text-gray-400">
        Pick option or enter your custom text and press Enter to add (your text
        is a string (characters, numbers, symbols,...) without start with{" "}
        <code>$.</code>
      </div>
      <SampleBLPTitle fields={value} />
    </>
  );
};

export default TaskConfTittle;
