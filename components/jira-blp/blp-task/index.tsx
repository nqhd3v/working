import { TJiraIssue } from "@nqhd3v/crazy/types/jira";
import { Badge, Button, Collapse, Modal, Tag } from "antd";
import TaskCollapseBody from "./task";
import Link from "next/link";
import { useJiraStore } from "@/stores/jira";
import { useBlpStore } from "@/stores/blueprint";
import { getTaskLink } from "@/utils/blp.request";
import { ReloadOutlined } from "@ant-design/icons";
import { twMerge } from "tailwind-merge";

const BlpNewTasks: React.FC<{ items: TJiraIssue[] }> = ({ items }) => {
  const colors = useJiraStore.useIssueTypeColors();
  const pageURL = useBlpStore.usePageURL();
  const tasks = useBlpStore.useTasks() || [];

  return (
    <Collapse
      items={items.map((item) => {
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
                  href={getTaskLink(pageURL || "", blpTask.reqId)}
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
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  Modal.confirm({
                    title: "Confirm your action",
                    content: (
                      <>
                        {blpTask ? (
                          <div className="text-gray-500 font-bold mb-2">
                            It looks like you already created another BLP task
                            before!
                          </div>
                        ) : null}

                        <div className="text-gray-500 mb-0">
                          This action will send the request to Blueprint to:
                        </div>
                        <div className="pl-5">
                          <Badge
                            color={blpTask ? "red" : "green"}
                            text="Create a new task"
                            className={twMerge(
                              "!block",
                              blpTask && "line-through"
                            )}
                          />
                          <Badge
                            color="green"
                            text="Update worklogs"
                            className="!block"
                          />
                          <Badge
                            color="green"
                            text="Update images"
                            className="!block"
                          />
                        </div>
                        <div className="text-red-400 font-bold">
                          You cannot UNDO this action!
                        </div>
                      </>
                    ),
                    okButtonProps: {
                      form: `form-issue--${item.id}`,
                      htmlType: "submit",
                    },
                    okText: "Continue",
                  });
                }}
              >
                Save
              </Button>
            </div>
          ),
          children: <TaskCollapseBody data={item} existedTask={blpTask} />,
        };
      })}
    />
  );
};

export default BlpNewTasks;
