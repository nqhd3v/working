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
  Input,
  Modal,
  ModalProps,
  notification,
  Select,
} from "antd";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import {
  EBiWeeklyReportMode,
  TGCalendarEvent,
  transformGoogleEvents,
} from "../utils";
import dynamic from "next/dynamic";
import FormItemWorkingTime from "./form-item-work-time";
import { Dayjs } from "dayjs";
import { minsToJiraTime } from "@/utils/mapping-data";
import InputTaskId, { TGetTaskHandler } from "./input-task-id";
import {
  TBlpTaskDetails,
  TBlpTaskJob,
  TProjectTransformed,
} from "@nqhd3v/crazy/types/blueprint";
import { getTaskJobs } from "@/app/actions/blueprint";
import { useBlpStore } from "@/stores/blueprint";
import { updateWorklogs } from "../handlers";
import { useBlueprintTasks } from "@/hooks/use-blp-tasks";
import { useBlueprintTask } from "@/hooks/use-blp-task";

const Description = dynamic(() => import("./task-content-editor"), {
  ssr: false,
});

const BiWeeklyTaskForm: React.FC<{
  events: TGCalendarEvent[];
  onUpdateEvents: () => void;
}> = ({ events, onUpdateEvents }) => {
  const [taskJobs, setTaskJobs] = useState<TBlpTaskJob[]>([]);
  const [state, setState] = useState<null | {
    state: "loading" | "error" | "done";
    message: string;
  }>(null);
  const { addWorklogs, removeWorklogs } = useBlueprintTasks();
  const { getJobs } = useBlueprintTask();

  const [form] = Form.useForm();
  const ev = transformGoogleEvents(events);
  const formInitialValues = useMemo(() => {
    const firstEvent = ev[0];
    const lastEvent = ev[ev.length - 1];
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
      textContent += '<li><p style="margin-left:0px;"><strong>';
      textContent += e.d.format("DD/MM/YYYY");
      textContent += "</strong></p><ul>";
      // meeting in day
      e.e.forEach(({ title, startTime, endTime }) => {
        workingTimeByDate[e.d.format("DD/MM/YYYY")].mins += endTime.diff(
          startTime,
          "minutes"
        );
        textContent += '<li><p style="margin-left:0px;">';
        textContent += `${title} - `;
        textContent += `(${startTime.format("HH:mm")} - ${endTime.format(
          "HH:mm"
        )})`;
        textContent += "</p></li>";
      });
      textContent += "</ul></li>";
    });
    textContent += "</ul>";

    return {
      title: `Bi-Weekly Report (${firstEvent.d.format(
        "MMM D, YYYY"
      )} - ${lastEvent.d.format("MMM D, YYYY")})`,
      content: textContent,

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
      jobs: taskJobs,
      workingTime: {
        [jobId]: workingTimes,
      },
      efforts: worklogs,
      clearOld: false,
      addWorklogs,
      removeWorklogs,
      setState,
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
      <Form initialValues={formInitialValues} layout="vertical" form={form}>
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
  if (!props.open) return null;

  return (
    <Modal
      title="Bi-weekly report"
      footer={null}
      width="calc(100% - 40px)"
      style={{ top: 20 }}
      {...props}
    >
      <div className="text-gray-400 mb-2">
        Follow{" "}
        <Link
          href="https://github.com/nqhd3v/working/blob/develop/docs/bi-weekly-gen-rp.md"
          target="_blank"
          className="!text-gray-500 underline"
        >
          this document
        </Link>{" "}
        to get your meetings & time.
      </div>

      <BiWeeklyElement />
    </Modal>
  );
};

export default ModalBiWeeklyReport;
