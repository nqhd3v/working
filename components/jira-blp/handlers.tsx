import { convertJiraTimeToHours } from "@/utils/mapping-data";
import { CheckCircleFilled, ExclamationCircleFilled } from "@ant-design/icons";
import { TBlpTaskEffort, TBlpTaskJob } from "@nqhd3v/crazy/types/blueprint";
import { notification } from "antd";
import { Dayjs } from "dayjs";
import { Dispatch, SetStateAction } from "react";

export const updateWorklogs = async ({
  taskId,
  workingTime,
  clearOld,
  jobs,
  efforts,
  addWorklogs,
  removeWorklogs,
  setState,
}: {
  // form
  taskId: string;
  workingTime: Record<string, { date: Dayjs; time: string }[]>;
  clearOld: boolean;
  // other
  jobs: TBlpTaskJob[];
  efforts?: TBlpTaskEffort[];
  // actions
  addWorklogs: (params: {
    taskId: string;
    worklogs: {
      date: string;
      mins: number;
      job: TBlpTaskJob;
    }[];
  }) => Promise<null | { success: any[]; fail: any[] }>;
  removeWorklogs: (params: {
    taskId: string;
    efforts: TBlpTaskEffort[];
  }) => Promise<null | { success: any[]; fail: any[] }>;
  setState: Dispatch<
    SetStateAction<null | {
      state: "loading" | "error" | "done";
      message: string;
    }>
  >;
}) => {
  const logs = Object.keys(workingTime || {})
    .map((jobId) => {
      if (!Array.isArray(workingTime[jobId])) return [];
      return workingTime[jobId].map((datetime) => {
        const job = jobs.find((j) => j.jbId === jobId) as TBlpTaskJob;
        return {
          date: datetime.date.format("YYYYMMDD"),
          mins: (convertJiraTimeToHours(datetime.time) || 0) * 60,
          job,
        };
      });
    })
    .flat();
  // remove

  if (clearOld && Array.isArray(efforts) && efforts.length > 0) {
    setState({ state: "loading", message: "deleting old worklogs..." });
    const res = await removeWorklogs({ taskId, efforts });
    if (!res) {
      setState({
        state: "error",
        message: "you need to configure for Blueprint task first!",
      });
      return;
    }

    notification.info({
      message: "Finish clear old worklogs",
      description: (
        <>
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircleFilled />
            <span>
              Removed <b>{res.success.length}</b> items successfully!
            </span>
          </div>
          <div className="flex items-center gap-2 text-red-400">
            <ExclamationCircleFilled />
            <span>
              Remove <b>{res.fail.length}</b> items failed!
            </span>
          </div>
        </>
      ),
    });
    console.info("Remove old worklogs result:", res);
  }

  setState({ state: "loading", message: "creating new worklogs..." });
  const addRes = await addWorklogs({ taskId, worklogs: logs });
  if (!addRes) {
    setState({
      state: "error",
      message: "you need to configure to create Blueprint's task first!",
    });
    return;
  }

  notification.info({
    message: "Finish create new worklogs",
    description: (
      <>
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircleFilled />
          <span>
            Removed <b>{addRes.success.length}</b> items successfully!
          </span>
        </div>
        <div className="flex items-center gap-2 text-red-400">
          <ExclamationCircleFilled />
          <span>
            Remove <b>{addRes.fail.length}</b> items failed!
          </span>
        </div>
      </>
    ),
  });
  console.info("Create new worklogs result:", addRes);
  setState({ state: "done", message: "done!" });
};