"use client";

import { DEFAULT_CONF_REG_TASK, useBlpStore } from "@/stores/blueprint";
import {
  convertJiraTimeToHours,
  generateBlpTaskTitleByFormat,
  generateTaskWorkingTimes,
  jiraTime,
  minsToJiraTime,
} from "@/utils/mapping-data";
import { TJiraIssue } from "@nqhd3v/crazy/types/jira";
import {
  Divider,
  Form,
  FormProps,
  Input,
  notification,
  UploadFile,
} from "antd";
import dynamic from "next/dynamic";
import React, { useState } from "react";
import { round } from "lodash";
import { TBlpTask, TBlpTaskEffort } from "@nqhd3v/crazy/types/blueprint";
import FormItemWorkingTime from "../components/form-item-work-time";
import ExistedTask from "../components/existed-task";
import { TTaskDetail } from "@/types/blp";
import { transformBlpImages, uploadFilesToBlueprint } from "../utils";
import dayjs, { Dayjs } from "dayjs";
import { useBlueprintTasks } from "@/hooks/use-blp-tasks";
import UploadDragDrop from "../components/upload-drag-drop";
import useProcess from "@/hooks/use-process";
import { getDefaultTaskContent } from "./utils";
import { useJiraStore } from "@/stores/jira";

const Description = dynamic(() => import("../components/task-content-editor"), {
  ssr: false,
});

const TaskCollapseBody: React.FC<{
  data: TJiraIssue;
  existedTask?: TBlpTask;
}> = ({ data, existedTask }) => {
  const [form] = Form.useForm();
  const { content, setState } = useProcess();
  const [taskDetails, setTaskDetails] = useState<TTaskDetail | null>(null);
  const { getTasks, createTask, addWorklogs } = useBlueprintTasks();
  const sprint = useJiraStore.useSelectedSprint();
  const { title: taskTitleFormat, jiraWorkHours } =
    useBlpStore.useConfForRegTask() || DEFAULT_CONF_REG_TASK;
  const phaseAssigner = useBlpStore.useConfPhaseAssignerByIssueType();
  const phases = phaseAssigner?.[data.fields.issuetype.id]?.phases;

  const picForTask =
    Array.isArray(phases) && phases[1] && phases[1].selected
      ? phases[1].assigners.find((a) => a.usrId === phases[1].selected)
      : undefined;

  const handleCreateTask = async (title: string, description: string) => {
    const newTask = await createTask({
      title,
      description,
      showNotification: true,
      issueType: data.fields.issuetype,
    });
    if (!newTask) return null;

    await getTasks();

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
  const handleUpdateImages = async (taskId: string, images: UploadFile[]) => {
    const newImages = images.filter((img) => !img.uid.startsWith("blp"));
    try {
      const result = await uploadFilesToBlueprint({
        taskId,
        files: newImages,
        onUpdateState: setState,
      });

      console.log({ result });
    } catch (e: any) {
      notification.error({ message: e.message });
    }
  };
  const handleSave: FormProps["onFinish"] = async ({
    title,
    description,
    workingTimes,
    files,
  }) => {
    try {
      !existedTask &&
        setState("loading")("sending a new request to create task...");
      const taskRes =
        existedTask || (await handleCreateTask(title, description));
      if (!taskRes) {
        throw new Error("unknown error when create task");
      }

      if (Array.isArray(workingTimes) && workingTimes.length > 0) {
        setState("loading")("sending new request(s) to add working times...");
        await handleUpdateWorklogs(taskRes?.reqId, workingTimes);
      }

      if (files && files.length > 0) {
        setState("loading")("sending new request(s) to add images...");
        await handleUpdateImages(taskRes.reqId, files);
      }
    } catch (e: any) {
      console.error("Error at client when handle save data:", e);
      setState("error")(e.message);
    } finally {
      setState("done")("save data finished!");
    }
  };

  const handleUpdateTaskDetails = (details: TTaskDetail) => {
    setTaskDetails(details);

    form.setFieldsValue({
      title: details.reqTitNm,
      content: details.reqCtnt,
      efforts: details.worklogs,
      files: transformBlpImages(details.arrFileRegist),
    });
  };

  return (
    <>
      <Form
        form={form}
        id={`form-issue--${data.id}`}
        initialValues={{
          title: taskDetails
            ? taskDetails.reqTitNm
            : generateBlpTaskTitleByFormat(data, taskTitleFormat),
          description: taskDetails
            ? taskDetails.reqCtnt
            : getDefaultTaskContent({
                pic: picForTask,
                issue: data,
                sprintName: sprint?.name!,
              }),
          files: taskDetails
            ? transformBlpImages(taskDetails.arrFileRegist)
            : [],
          efforts: taskDetails ? taskDetails.worklogs : undefined,

          workingTimes: generateTaskWorkingTimes(
            data.fields.worklog.worklogs,
            jiraWorkHours
          ),
          existedTask,
        }}
        onFinish={handleSave}
        layout="vertical"
      >
        <div className="grid grid-cols-5 gap-5">
          <div className="col-span-3">
            <ExistedTask
              task={existedTask}
              onGetTask={handleUpdateTaskDetails}
            />
            <Form.Item
              name="title"
              className="!mt-6"
              rules={[{ required: true, message: "input your task's title" }]}
            >
              <Input placeholder="Task's title" />
            </Form.Item>
            <Form.Item
              name="description"
              rules={[{ required: true, message: "input your task's content" }]}
            >
              <Description />
            </Form.Item>

            <Form.Item name="files">
              <UploadDragDrop />
            </Form.Item>
          </div>
          <div className="col-span-2 !mb-0">
            <Form.List name="workingTimes">
              {(fields, { add, remove }) => {
                return (
                  <div>
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
            <div className="text-xs text-gray-400 mt-3">
              <div className="text-gray-500 font-bold">Timelog on Jira:</div>
              <div>
                {!Array.isArray(data.fields.worklog.worklogs) ||
                data.fields.worklog.worklogs.length === 0 ? (
                  <span className="text-gray-400">no worklogs found!</span>
                ) : (
                  data.fields.worklog?.worklogs.map((worklog) => {
                    return (
                      <div key={worklog.id}>
                        <span className="font-bold">
                          {worklog.updateAuthor.displayName}
                        </span>
                        {" spend "}
                        <span className="font-bold">
                          {worklog.timeSpent} (
                          {round(worklog.timeSpentSeconds / 3600, 2)}h)
                        </span>
                        {" at "}
                        <span className="font-bold">
                          {jiraTime(worklog.started).format("DD/MM/YYYY HH:mm")}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            <Form.Item name="efforts">
              <TaskEfforts />
            </Form.Item>
            <Divider />
            {content || (
              <span className="text-gray-400 italic">
                no action in progress
              </span>
            )}
          </div>
        </div>
        {!taskTitleFormat ? (
          <>
            By default, task&#39;s title follow the format{" "}
            <code>[TASK_KEY] - [TASK_SUMMARY]</code>, go to config for creating
            task to configure your format!
          </>
        ) : null}
      </Form>
    </>
  );
};

const TaskEfforts: React.FC<{ value?: TBlpTaskEffort[] }> = ({ value }) => {
  if (!Array.isArray(value)) return null;

  if (value.length === 0) {
    return (
      <div className="text-xs text-gray-400">
        <div className="text-gray-500 font-bold">no timelogs on Blueprint!</div>
      </div>
    );
  }

  return (
    <div className="text-xs text-gray-400">
      <div className="text-gray-500 font-bold">Timelog on Blueprint</div>
      <div>
        {value.length === 0
          ? "no timelog found"
          : value
              .sort((a, b) =>
                dayjs(b.wrkDt, "YYYYMMDD").isAfter(dayjs(a.wrkDt, "YYYYMMDD"))
                  ? -1
                  : 1
              )
              .map((effort) => (
                <div key={effort.actEfrtSeqNo}>
                  <span className="font-bold">{effort.usrNm}</span>
                  {" added "}
                  <span className="font-bold">
                    {minsToJiraTime(Number(effort.actEfrtMnt))}
                  </span>
                  {` (${effort.jbNm})`}
                  {" on "}
                  <span className="font-bold">
                    {dayjs(effort.wrkDt, "YYYYMMDD").format("DD/MM/YYYY")}
                  </span>
                </div>
              ))}
      </div>
    </div>
  );
};

export default TaskCollapseBody;
