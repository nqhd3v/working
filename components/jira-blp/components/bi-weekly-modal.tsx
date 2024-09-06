import { useValidJSONArray } from "@/hooks/use-valid-json-array";
import {
  ExclamationCircleOutlined,
  ReloadOutlined,
  RestOutlined,
} from "@ant-design/icons";
import {
  Button,
  Checkbox,
  Dropdown,
  Form,
  FormProps,
  Input,
  Modal,
  ModalProps,
  notification,
  Select,
  Tooltip,
} from "antd";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import {
  EBiWeeklyReportMode,
  getConfirmAssigner,
  TGCalendarEvent,
  transformGoogleEvents,
} from "../utils";
import dynamic from "next/dynamic";
import FormItemWorkingTime from "./form-item-work-time";
import dayjs, { Dayjs } from "dayjs";
import {
  convertJiraTimeToHours,
  jiraTime,
  minsToJiraTime,
} from "@/utils/mapping-data";
import InputTaskId, { TGetTaskHandler } from "./input-task-id";
import {
  TBlpTaskDetails,
  TBlpTaskJob,
  TBlpUserRole,
  TProjectTransformed,
} from "@nqhd3v/crazy/types/blueprint";
import { getTaskJobs } from "@/app/actions/blueprint";
import { useBlpStore } from "@/stores/blueprint";
import { updateWorklogs } from "../handlers";
import { useBlueprintTasks } from "@/hooks/use-blp-tasks";
import { useBlueprintTask } from "@/hooks/use-blp-task";
import useProcess from "@/hooks/use-process";
import { useJiraStore } from "@/stores/jira";
import { MEETING_EVENTS_RETRIEVE_SCRIPT } from "@/utils/constant";

const Description = dynamic(() => import("./task-content-editor"), {
  ssr: false,
});

const defaultTextContent = ({
  pic,
  startDate,
  endDate,
}: {
  pic?: TBlpUserRole;
  startDate: Dayjs;
  endDate: Dayjs;
}) => {
  return (
    `<p>Dear ${pic ? pic.usrNm : "PIC"},</p>` +
    "<p>I would like to update the Scrum Events that I participated from " +
    startDate.format("Do MMMM") +
    " to " +
    endDate.format("Do MMMM") +
    ".<br>Please help me approve this ticket.<br>" +
    "Thank you.</p><br>"
  );
};

const BiWeeklyTaskForm: React.FC<{
  events: TGCalendarEvent[];
  onUpdateEvents: () => void;
}> = ({ events, onUpdateEvents }) => {
  const [taskJobs, setTaskJobs] = useState<TBlpTaskJob[]>([]);
  const { content, setState } = useProcess();
  const { createTask, addWorklogs, removeWorklogs } = useBlueprintTasks();
  const { getJobs } = useBlueprintTask();
  const sprint = useJiraStore.useSelectedSprint();
  const category = useBlpStore.useSelectedCategory();
  const conf = useBlpStore.useConfPhaseAssignerSprintTasks();

  const [form] = Form.useForm();
  const ev = transformGoogleEvents(events);
  const formInitialValues = useMemo(() => {
    let textContent = "<ul>";
    const workingTimeByDate: Record<string, { date: Dayjs; mins: number }> =
      {} satisfies Record<string, { date: Dayjs; mins: number }>;
    // each day
    ev.forEach((e) => {
      // workingTimes
      if (!workingTimeByDate[e.d.format("DD/MM/YYYY")]) {
        workingTimeByDate[e.d.format("DD/MM/YYYY")] = {
          date: e.d,
          mins: 0,
        };
      }
      // textContent
      textContent += '<li><p style="margin-left:0px;">';
      textContent += e.d.format("dddd, MMMM D");
      textContent += ":</p><ul>";
      // meeting in day
      e.e.forEach(({ title, startTime, endTime }) => {
        const hoursGap = endTime.diff(startTime, "hours", true);
        workingTimeByDate[e.d.format("DD/MM/YYYY")].mins += endTime.diff(
          startTime,
          "minutes"
        );
        textContent += '<li><p style="margin-left:0px;">';
        textContent += `${title} - `;
        textContent += `(${startTime.format("HH:mm")} - ${endTime.format(
          "HH:mm"
        )}) - `;
        textContent += `${hoursGap}h`;
        textContent += "</p></li>";
      });
      textContent += "</ul></li>";
    });
    textContent += "</ul>";
    const startDate = dayjs(new Date(sprint!.startDate));
    const endDate = dayjs(new Date(sprint!.endDate));
    const sprintRangeDate = [
      startDate.format("MMM D"),
      endDate.format("MMM D"),
    ].join(" - ");

    return {
      title: `[${category!.pjtNm}] ${
        sprint!.name
      } (${sprintRangeDate}) - Scrum Events Report`,
      content:
        defaultTextContent({
          startDate,
          endDate,
          pic: getConfirmAssigner(conf?.phases),
        }) + textContent,

      workingTimes: Object.values(workingTimeByDate)
        .sort((a, b) => (a.date.isAfter(b.date) ? 1 : -1))
        .map((item) => ({
          date: item.date,
          time: minsToJiraTime(item.mins),
        })),
    };
  }, [ev]);

  useEffect(() => {
    return () => form.resetFields();
  }, []);

  const handleAddWorklogOnly = async () => {
    const { taskId, workingTimes, jobId, worklogs } =
      await form.validateFields();
    if (
      !taskId ||
      !jobId ||
      !workingTimes ||
      workingTimes.length === 0 ||
      taskJobs.length === 0
    ) {
      notification.error({ message: "missed configuration!" });
      return;
    }

    await updateWorklogs({
      taskId,
      workingTimes,
      efforts: worklogs,
      clearOld: false,
      addWorklogs,
      removeWorklogs,
      setState,
    });
  };

  const handleCreateTask = async (title: string, description: string) => {
    const newTask = await createTask({
      title,
      description,
      showNotification: true,
      forSprintTasks: true,
    });
    if (!newTask) return null;

    return newTask;
  };
  const handleUpdateWorklogs = async (
    taskId: string,
    workingTimes: { date: Dayjs; time: string }[]
  ) => {
    return await addWorklogs({
      taskId,
      worklogs: workingTimes.map((t) => ({
        date: t.date.format("YYYYMMDD"),
        mins: ((convertJiraTimeToHours(t.time) as number) || 0) * 60,
      })),
      showNotification: true,
    });
  };

  const handleUpdateDataFromTaskExisted: TGetTaskHandler = async (task) => {
    if (!task) return;

    form.setFieldsValue({
      title: task.reqTitNm,
      content: task.reqCtnt,
      worklogs: task.worklogs,
    });

    const res = await getJobs({ taskId: task.reqId, showNotification: true });
    res && setTaskJobs(res);
  };

  const handleSaveAll: FormProps["onFinish"] = async ({
    title,
    content,
    workingTimes,
  }) => {
    try {
      setState("loading")("sending a new request to create task...");
      const taskRes = await handleCreateTask(title, content);
      if (!taskRes) {
        throw new Error("unknown error when create task");
      }

      if (Array.isArray(workingTimes) && workingTimes.length > 0) {
        setState("loading")("sending new request(s) to add working times...");
        await handleUpdateWorklogs(taskRes?.reqId, workingTimes);
      }
    } catch (e: any) {
      console.error("Error at client when handle save data:", e);
      setState("error")(e.message);
    } finally {
      setState("done")("save data finished!");
    }
  };

  return (
    <>
      <div className="text-gray-400 mb-2">
        <span
          className="text-gray-600 underline"
          onClick={() => {
            form.resetFields();
            onUpdateEvents();
          }}
        >
          Update JSON data?
        </span>
      </div>
      <Form
        initialValues={formInitialValues}
        layout="vertical"
        form={form}
        onFinish={handleSaveAll}
      >
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-5">
          <div className="col-span-1 lg:col-span-3">
            <div className="grid grid-cols-2 gap-3">
              <Form.Item
                name="taskId"
                label="Task"
                help="Paste your Task ID here if you created it before!"
              >
                <InputTaskId onGetTask={handleUpdateDataFromTaskExisted} />
              </Form.Item>
              <Form.Item shouldUpdate noStyle>
                {({ getFieldValue }) => {
                  const taskId = getFieldValue("taskId");
                  const worklogs = getFieldValue("worklogs");

                  return (
                    <div>
                      <Form.Item
                        name="jobId"
                        label="Job"
                        rules={
                          taskId
                            ? [
                                {
                                  required: true,
                                  message: "select job for working-time",
                                },
                              ]
                            : []
                        }
                      >
                        <Select
                          options={taskJobs.map((j) => ({
                            label: j.jbNm,
                            value: j.jbId,
                          }))}
                        />
                      </Form.Item>
                      <Form.Item name="clearOld" valuePropName="checked">
                        <Checkbox
                          disabled={
                            !Array.isArray(worklogs) || worklogs.length === 0
                          }
                        >
                          Is need to clear old worklogs?
                        </Checkbox>
                      </Form.Item>
                    </div>
                  );
                }}
              </Form.Item>
            </div>
            <Form.Item
              label="Title"
              name="title"
              rules={[{ required: true, message: "enter your title" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Content"
              name="content"
              rules={[{ required: true, message: "enter your content" }]}
            >
              <Description />
            </Form.Item>
          </div>
          <Form.Item label="Working-time" className="col-span-1 lg:col-span-2">
            <Form.List name="workingTimes">
              {(fields, { add, remove }) => {
                if (fields.length === 0) {
                  return (
                    <div className="p-3 rounded bg-gray-100">
                      <Button onClick={() => add()}>add working-time</Button>
                    </div>
                  );
                }
                return (
                  <div className=" overflow-x-hidden overflow-y-auto max-h-[600px]">
                    {fields.map((field) => (
                      <FormItemWorkingTime
                        fieldKey={field.name}
                        key={field.key}
                        add={add}
                        remove={remove}
                      />
                    ))}
                  </div>
                );
              }}
            </Form.List>
          </Form.Item>
          {content && <div className="p-5 bg-gray-100 rounded">{content}</div>}
        </div>

        <div className="w-full flex items-center gap-2 justify-end">
          <Button icon={<ReloadOutlined />} htmlType="reset" danger />
          <div>
            <Dropdown.Button
              type="primary"
              htmlType="submit"
              menu={{
                items: [
                  {
                    key: "bi-weekly-actions--add-work-logs",
                    label: "Add worklogs only",
                    onClick: () => handleAddWorklogOnly(),
                    className: "w-auto",
                  },
                ],
              }}
            >
              Create task & add times
            </Dropdown.Button>
          </div>
        </div>
      </Form>
    </>
  );
};

const BiWeeklyElement = () => {
  const [mode, setMode] = useState<EBiWeeklyReportMode>(
    EBiWeeklyReportMode.INIT
  );
  const [jsonData, setJsonData] = useState("");
  const { error, data: jsonParsed } =
    useValidJSONArray<TGCalendarEvent>(jsonData);

  if (mode === EBiWeeklyReportMode.DATA) {
    return (
      <BiWeeklyTaskForm
        events={jsonParsed}
        onUpdateEvents={() => {
          setMode(EBiWeeklyReportMode.INIT);
        }}
      />
    );
  }

  return (
    <div className="text-gray-400 relative">
      Paste your JSON data to the textbox below to get the report content
      <Input.TextArea
        autoSize={{ minRows: 10 }}
        placeholder="[{..somethings here}]"
        className="!pb-10"
        value={jsonData}
        onChange={({ target }) => setJsonData(target.value)}
      />
      <div className="absolute bottom-0 h-12 w-[calc(100%-24px)] flex items-center left-3">
        {error ? (
          <div className="flex items-center gap-1 text-red-500">
            <ExclamationCircleOutlined />
            <span>{error} activity! Check again!</span>
          </div>
        ) : null}
        <Button
          className="ml-auto"
          type="primary"
          onClick={() => setMode(EBiWeeklyReportMode.DATA)}
          disabled={!!error}
        >
          Get content
        </Button>
      </div>
    </div>
  );
};

const ModalBiWeeklyReport: React.FC<Omit<ModalProps, "title" | "children">> = (
  props
) => {
  const sprint = useJiraStore.useSelectedSprint();
  if (!props.open) return null;

  return (
    <Modal
      title="Bi-weekly report"
      footer={null}
      width="calc(100% - 40px)"
      style={{ top: 20 }}
      {...props}
    >
      {sprint ? (
        <>
          <div className="text-gray-400 mb-2">
            Follow{" "}
            <Link
              href="https://github.com/nqhd3v/working/blob/develop/docs/bi-weekly-gen-rp.md"
              target="_blank"
              className="!text-gray-500 underline"
            >
              this document
            </Link>{" "}
            to get your meetings & time. Or click{" "}
            <Tooltip
              title={
                <>
                  <b className="text-red-400 uppercase font-bold">important:</b>{" "}
                  You need to <b>assign your permission</b> to get your events!
                </>
              }
              placement="bottom"
            >
              <Link
                href={`${MEETING_EVENTS_RETRIEVE_SCRIPT}?teams=pm&start=${jiraTime(
                  sprint.startDate
                ).format("YYYY-MM-DD")}&end=${jiraTime(sprint.endDate).format(
                  "YYYY-MM-DD"
                )}`}
                target="_blank"
                className="!text-gray-500 underline"
              >
                here
              </Link>
            </Tooltip>{" "}
            to get your event in {sprint.name}!
          </div>

          <BiWeeklyElement />
        </>
      ) : (
        <div>no sprint selected</div>
      )}
    </Modal>
  );
};

export default ModalBiWeeklyReport;
