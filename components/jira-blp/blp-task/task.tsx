"use client";

import { DEFAULT_CONF_REG_TASK, useBlpStore } from "@/stores/blueprint";
import {
  generateBlpTaskTitleByFormat,
  generateTaskWorkingTimes,
  htmlToText,
  jiraTime,
} from "@/utils/mapping-data";
import { TJiraIssue } from "@nqhd3v/crazy/types/jira";
import { Form, FormProps, Input, notification } from "antd";
import dynamic from "next/dynamic";
import React from "react";
import { round } from "lodash";
import { createBlpTask } from "@/utils/blp.request";
import { TBlpUserRole } from "@nqhd3v/crazy/types/blueprint";
import UploadImagesForTask from "../components/upload-file";
import FormItemWorkingTime from "../components/form-item-work-time";

const Description = dynamic(() => import("../components/task-content-editor"), {
  ssr: false,
});

const TaskCollapseBody: React.FC<{ data: TJiraIssue }> = ({ data }) => {
  const project = useBlpStore.useSelectedProject();
  const category = useBlpStore.useSelectedCategory();
  const initTaskConf = useBlpStore.useConfForInitTask();
  const regTaskConf = useBlpStore.useConfForRegTask();

  const { title: taskTitleFormat, jiraWorkHours } =
    useBlpStore.useConfForRegTask() || DEFAULT_CONF_REG_TASK;

  const handleCreateTask: FormProps["onFinish"] = async ({
    title,
    description,
    workingTime,
    files,
  }) => {};
  return (
    <Form
      id={`form-issue--${data.id}`}
      initialValues={{
        title: generateBlpTaskTitleByFormat(data, taskTitleFormat),
        description: data.fields.description,
        workingTimes: generateTaskWorkingTimes(
          data.fields.worklog.worklogs,
          jiraWorkHours
        ),
      }}
      onFinish={handleCreateTask}
      layout="vertical"
    >
      <div className="grid grid-cols-5 gap-5">
        <div className="col-span-3">
          <Form.Item label="Info" className="!mb-0">
            <Form.Item
              name="title"
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
          </Form.Item>
        </div>
        <Form.Item label="Working time" className="col-span-2 !mb-0">
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
          <div className="text-xs text-gray-400">
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
        </Form.Item>
      </div>
      <Form.Item name="files">
        <UploadImagesForTask />
      </Form.Item>
      {!taskTitleFormat ? (
        <>
          By default, task&#39;s title follow the format{" "}
          <code>[TASK_KEY] - [TASK_SUMMARY]</code>, go to config for creating
          task to configure your format!
        </>
      ) : null}
    </Form>
  );
};

export default TaskCollapseBody;
