import { Button, Form, FormProps, notification, Tag } from "antd";
import { TConfPhaseAssigner, TNewTaskBaseInfoValuesFullFilled } from "./types";
import { useBlpStore } from "@/stores/blueprint";
import { useState } from "react";
import { getBlpProcessPhasesByProcess } from "@/utils/blp.request";
import { twMerge } from "tailwind-merge";
import NewTaskBaseInfo from "./base-info";
import PhaseAssigners from "./phase-assigner";
import { useJiraStore } from "@/stores/jira";
import { NamePath } from "antd/es/form/interface";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import {
  isMissConfIssueTypePhaseAssigner,
  isMissConfPhaseAssigner,
  isMissConfSprintTasksPhaseAssigner,
} from "./utils";
import { TConfPhaseAssignerByIssueType } from "@/types/blp";

const IssueTypesForm: React.FC<{ onDone?: () => void }> = ({ onDone }) => {
  const issueTypes = useJiraStore.useSelectedIssueTypes();
  const confPhaseAssignerByIssueType =
    useBlpStore.useConfPhaseAssignerByIssueType();
  const confPhaseAssignerSprintTasks =
    useBlpStore.useConfPhaseAssignerSprintTasks();
  const updatePhaseAssignerByIssueType =
    useBlpStore.useUpdateConfPhaseAssignersByIssueType();
  const updatePhaseAssignerSprintTasks =
    useBlpStore.useUpdateConfPhaseAssignersSprintTasks();

  if (!issueTypes || issueTypes.length === 0) {
    return (
      <div className="py-5 rounded bg-gray-100 text-center font-bold">
        no issue types selected
      </div>
    );
  }

  const handleSaveConfAssigners: FormProps["onFinish"] = ({
    issueTypes,
    sprintTasks,
  }: {
    issueTypes: TConfPhaseAssigner[];
    sprintTasks: TConfPhaseAssigner;
  }) => {
    if (
      isMissConfSprintTasksPhaseAssigner(sprintTasks) ||
      isMissConfIssueTypePhaseAssigner(issueTypes)
    ) {
      notification.error({
        message: "Missed configure task's content by issue-type!",
        description:
          "Re-check again! Make sure you select assigner for all phases in Sprint Tasks, or Issue Type!",
      });
      return;
    }

    const issueTypeData = issueTypes.reduce(
      (res: TConfPhaseAssignerByIssueType, cur) => {
        res[cur.info.id] = {
          base: cur.base as TNewTaskBaseInfoValuesFullFilled,
          phases: cur.phases,
        };

        return res;
      },
      {}
    );

    updatePhaseAssignerByIssueType(issueTypeData);
    updatePhaseAssignerSprintTasks({
      base: sprintTasks.base as TNewTaskBaseInfoValuesFullFilled,
      phases: sprintTasks.phases,
    });

    onDone?.();
  };

  return (
    <Form
      initialValues={{
        issueTypes: issueTypes?.map((issueType) => ({
          info: issueType,
          base: confPhaseAssignerByIssueType?.[issueType.id].base,
          phases: confPhaseAssignerByIssueType?.[issueType.id].phases,
        })),
        sprintTasks: confPhaseAssignerSprintTasks,
      }}
      onFinish={handleSaveConfAssigners}
    >
      <ConfForSprintTasks className="mb-3" />
      <Form.List name="issueTypes">
        {(fields) => {
          if (!Array.isArray(fields) || fields.length === 0) {
            return (
              <div className="py-5 text-center font-bold text-gray-400">
                no issue types selected
              </div>
            );
          }
          return (
            <div className="grid grid-cols-1 gap-3">
              {fields.map((issueType) => (
                <ConfByIssueType name={issueType.name} key={issueType.key} />
              ))}
            </div>
          );
        }}
      </Form.List>
      <div className="pt-5 flex items-center justify-end">
        <Button htmlType="submit" type="primary">
          Save
        </Button>
      </div>
    </Form>
  );
};
const ConfByIssueType: React.FC<{
  name: NamePath;
}> = ({ name }) => {
  const form = Form.useFormInstance();
  const project = useBlpStore.useSelectedProject();
  const category = useBlpStore.useSelectedCategory();
  const colors = useJiraStore.useIssueTypeColors();
  const [loading, setLoading] = useState(false);

  const handleFullFillBaseInfo = (values: TNewTaskBaseInfoValuesFullFilled) => {
    if (!project || !category) return;

    getBlpProcessPhasesByProcess({
      projectId: project.id,
      subProjectId: category.prntPjtId,
      processId: values.process.bizProcId,
      iterationId: values.iteration.itrtnId,
      onData: (p) => {
        form.setFieldValue(["issueTypes", name, "phases"], p);
      },
      onLoading: setLoading,
    });
  };

  return (
    <div className="p-3 rounded bg-white border border-gray-100">
      <Form.Item noStyle shouldUpdate>
        {({ getFieldValue }) => {
          const issueType = getFieldValue(["issueTypes", name, "info"]);
          const phases = getFieldValue(["issueTypes", name, "phases"]);

          return (
            <div className="flex gap-2 mb-3 items-center justify-between">
              <Tag color={colors?.[issueType.id]}>{issueType.name}</Tag>
              {isMissConfPhaseAssigner(phases) ? (
                <div className="text-red-400 flex items-center gap-2">
                  <ExclamationCircleOutlined />
                  <span>Missed configure for this!</span>
                </div>
              ) : null}
            </div>
          );
        }}
      </Form.Item>
      <Form.Item
        name={[name, "base"]}
        className="!mb-3"
        rules={[
          () => ({
            validator(_, value) {
              if (
                !value ||
                !value.jobType ||
                !value.iteration ||
                !value.process
              ) {
                return Promise.reject("");
              }
              return Promise.resolve();
            },
          }),
        ]}
      >
        <NewTaskBaseInfo
          onFullFilled={handleFullFillBaseInfo}
          disabled={loading}
        />
      </Form.Item>
      <PhaseAssigners name={name} />
    </div>
  );
};

export default IssueTypesForm;

const ConfForSprintTasks = ({ className }: { className?: string }) => {
  const form = Form.useFormInstance();
  const project = useBlpStore.useSelectedProject();
  const category = useBlpStore.useSelectedCategory();
  const [loading, setLoading] = useState(false);

  const handleFullFillBaseInfo = (values: TNewTaskBaseInfoValuesFullFilled) => {
    if (!project || !category) return;

    getBlpProcessPhasesByProcess({
      projectId: project.id,
      subProjectId: category.prntPjtId,
      processId: values.process.bizProcId,
      iterationId: values.iteration.itrtnId,
      onData: (p) => {
        form.setFieldValue(["sprintTasks", "phases"], p);
      },
      onLoading: setLoading,
    });
  };

  return (
    <div
      className={twMerge(
        "p-3 rounded bg-white border border-gray-100",
        className
      )}
    >
      <Form.Item noStyle shouldUpdate>
        {({ getFieldValue }) => {
          const phases = getFieldValue(["sprintTasks", "phases"]);

          return (
            <div className="flex gap-2 mb-3 items-center justify-between">
              <Tag>Sprint Tasks</Tag>
              {isMissConfPhaseAssigner(phases) ? (
                <div className="text-red-400 flex items-center gap-2">
                  <ExclamationCircleOutlined />
                  <span>Missed configure for this!</span>
                </div>
              ) : null}
            </div>
          );
        }}
      </Form.Item>
      <Form.Item
        name={["sprintTasks", "base"]}
        className="!mb-3"
        rules={[
          () => ({
            validator(_, value) {
              if (
                !value ||
                !value.jobType ||
                !value.iteration ||
                !value.process
              ) {
                return Promise.reject("");
              }
              return Promise.resolve();
            },
          }),
        ]}
      >
        <NewTaskBaseInfo
          onFullFilled={handleFullFillBaseInfo}
          disabled={loading}
        />
      </Form.Item>
      <PhaseAssigners name="sprintTasks" />
    </div>
  );
};
