import { TJiraIssue, TJiraIssueType } from "@nqhd3v/crazy/types/jira";
import {
  Badge,
  Button,
  CollapseProps,
  Modal,
  notification,
  Skeleton,
  Space,
  Tag,
} from "antd";
import TaskCollapseBody from "./task";
import { ReloadOutlined, SettingOutlined } from "@ant-design/icons";
import Link from "next/link";
import { TBlpTask, TBlpUserRole } from "@nqhd3v/crazy/types/blueprint";
import { TJiraIssueTypeColors } from "@/types";
import { twMerge } from "tailwind-merge";
import { getIssueLink } from "@/utils/jira.request";
import { useBlpStore } from "@/stores/blueprint";

export const renderIssues = ({
  items,
  tasks,
  colors,
  loading = false,
  getTaskLink,
}: {
  items: TJiraIssue[];
  tasks: TBlpTask[];
  colors: TJiraIssueTypeColors | null;
  loading?: boolean;
  isInTour?: boolean;
  getTaskLink: (taskId: string) => string;
}): CollapseProps["items"] => {
  if (loading) {
    return [
      {
        id: "mock_guide",
        key: "mock_guide_0",
        headerClass: "!items-center",
        collapsible: "disabled",
        label: <CollapseIssueLabelSkeleton />,
        extra: <CollapseIssueExtraSkeleton />,
      },
      {
        id: "mock_guide",
        key: "mock_guide_1",
        headerClass: "!items-center",
        collapsible: "disabled",
        label: <CollapseIssueLabelSkeleton />,
        extra: <CollapseIssueExtraSkeleton />,
      },
      {
        id: "mock_guide",
        key: "mock_guide_2",
        headerClass: "!items-center",
        collapsible: "disabled",
        label: <CollapseIssueLabelSkeleton />,
        extra: <CollapseIssueExtraSkeleton />,
      },
    ];
  }

  return items.map((item) => {
    const blpTask = tasks.find((t) =>
      t.reqTitNm.toUpperCase().includes(item.key.toUpperCase())
    );
    return {
      id: item.id,
      key: item.id,
      headerClass: "!items-center",
      // forceRender: true,
      label: (
        <>
          <Tag color={colors?.[item.fields.issuetype.id]}>
            {item.fields.issuetype.name}
          </Tag>
          {blpTask ? (
            <Link
              href={getTaskLink(blpTask.reqId)}
              target="_blank"
              onClick={(e) => e.stopPropagation()}
            >
              <Tag color="cyan-inverse">{blpTask.reqId}</Tag>
            </Link>
          ) : null}
          <Link
            target="_blank"
            className="text-gray-600/50"
            href={"https://oneline.atlassian.net/browse/" + item.key}
          >
            {item.key}
          </Link>
          {" · "}
          <span className="font-bold text-gray-600/70">
            {item.fields.summary}
          </span>
        </>
      ),
      extra: (
        <div className="flex items-center gap-2">
          <Button
            ghost
            danger
            icon={<ReloadOutlined />}
            form={`form-issue--${item.id}`}
            onClick={(e) => e.stopPropagation()}
            htmlType="reset"
          />
          <SaveTaskAction task={blpTask} issue={item} />
        </div>
      ),
      children: <TaskCollapseBody data={item} existedTask={blpTask} />,
    };
  });
};

export const CollapseIssueLabelSkeleton = () => {
  return (
    <Space>
      <Skeleton title={{ width: 60 }} paragraph={false} active />
      <Skeleton title={{ width: 180 }} paragraph={false} active />
      <Skeleton title={{ width: 80 }} paragraph={false} active />
      {" · "}
      <Skeleton title={{ width: 420 }} paragraph={false} active />
    </Space>
  );
};

export const CollapseIssueExtraSkeleton = () => {
  return (
    <div className="flex items-center gap-2">
      <Skeleton.Button active className="w-8" />
      <Skeleton.Button active className="w-16" />
    </div>
  );
};

export const SaveTaskAction: React.FC<{
  task?: TBlpTask;
  issue: TJiraIssue;
}> = ({ task, issue }) => {
  const confByIssueType = useBlpStore.useConfPhaseAssignerByIssueType();
  const currentConf = confByIssueType?.[issue.fields.issuetype.id];

  return (
    <Button
      onClick={(e) => {
        e.stopPropagation();
        if (!currentConf) {
          notification.error({
            message: "Missed configuration!",
            description: (
              <>
                Hover on <SettingOutlined />, click on{" "}
                <b>Configure task&apos;s info by issue-type</b>, and try again
                later!
              </>
            ),
          });
          return;
        }
        Modal.confirm({
          title: "Confirm your action",
          content: (
            <>
              {task ? (
                <div className="text-gray-500 font-bold mb-2">
                  It looks like you already created another BLP task before!
                </div>
              ) : null}

              <div className="text-gray-500 mb-0">
                This action will send the request to Blueprint to:
              </div>
              <div className="pl-5">
                <Badge
                  color={task ? "red" : "green"}
                  text="Create a new task"
                  className={twMerge("!block", task && "line-through")}
                />
                <Badge
                  color="green"
                  text="Update worklogs"
                  className="!block"
                />
                <Badge color="green" text="Update images" className="!block" />
              </div>
              <div className="text-red-400 font-bold">
                You cannot UNDO this action!
              </div>
            </>
          ),
          okButtonProps: {
            form: `form-issue--${issue.id}`,
            htmlType: "submit",
          },
          okText: "Continue",
        });
      }}
    >
      Save
    </Button>
  );
};

export const getDefaultTaskContent = ({
  pic,
  issue,
  sprintName,
}: {
  pic?: TBlpUserRole;
  issue: TJiraIssue;
  sprintName: string;
}) => {
  return (
    `<p>Dear ${pic ? pic.usrNm : "PIC"}!<p>` +
    `<p>I would like to update the tasks that I have done in the ${sprintName}!<br>` +
    "Please help me approve this ticket.<br>" +
    "Thank you.</p>" +
    '<p class="text-small">Jira Issue: ' +
    `<a href="${getIssueLink(issue.key)}">` +
    `${issue.key} - ${issue.fields.summary}</a></p>` +
    "<p>Description of the task: " +
    issue.fields.description +
    "</p>"
  );
};
