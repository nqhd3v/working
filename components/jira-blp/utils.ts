import { addFilesToTask, uploadFile } from "@/app/actions/blueprint";
import { TSetProcessState } from "@/hooks/use-process";
import { TBlpTaskFile, TFileUploadInfo } from "@nqhd3v/crazy/types/blueprint";
import { SelectProps, UploadFile } from "antd";
import dayjs, { Dayjs } from "dayjs";
import path from "path";
import { v4 } from "uuid";

export enum EBiWeeklyReportMode {
  INIT = "init",
  DATA = "data",
}

export type TGCalendarEvent = {
  title: string;
  startTime: string;
  endTime: string;
};

export type TGCalendarEventTransformed = {
  title: string;
  startTime: Dayjs;
  endTime: Dayjs;
};

export const JIRA_ISSUE_TO_BLP_TASK_TITLE: SelectProps["options"] = [
  { label: "{JIRA_ISSUE_KEY}", value: "JIRA_ISSUE_KEY" },
  { label: "{JIRA_ISSUE_SUMMARY}", value: "JIRA_ISSUE_SUMMARY" },
];

export const transformGoogleEvents = (events: TGCalendarEvent[]) => {
  const dic = events.reduce(
    (
      res: Record<
        string,
        { k: string; d: Dayjs; e: TGCalendarEventTransformed[] }
      >,
      cur
    ) => {
      const date = dayjs(new Date(cur.startTime));
      const dateStr = date.format("DD/MM/YYYY");
      if (!res[dateStr]) {
        res[dateStr] = { d: date, k: dateStr, e: [] };
      }

      res[dateStr].e.push({
        title: cur.title,
        startTime: dayjs(new Date(cur.startTime)),
        endTime: dayjs(new Date(cur.endTime)),
      });
      return res;
    },
    {}
  );
  return Object.keys(dic)
    .sort((a, b) =>
      dayjs(a, "DD/MM/YYYY")
        .startOf("d")
        .isBefore(dayjs(b, "DD/MM/YYYY").startOf("d"))
        ? -1
        : 1
    )
    .map((d) => dic[d]);
};

export const transformBlpImages = (images: TBlpTaskFile[]): UploadFile[] => {
  if (!Array.isArray(images) || images.length === 0) return [];

  return images.map((img) => ({
    uid: `blp-${img.atchNo}`,
    url: `https://blueprint.cyberlogitec.com.vn/${img.fileLocUrl}/${img.fileNm}`,
    thumbUrl: `https://blueprint.cyberlogitec.com.vn/${img.fileLocUrl}/${img.fileNm}`,
    status: "done",
    name: img.fileNm,
    fileName: img.fileNm,
  }));
};

// actions
export const uploadFilesToBlueprint = async ({
  taskId,
  files,
  allowEmpty,
  onUpdateState,
}: {
  taskId: string;
  files: UploadFile[];
  allowEmpty?: boolean;
  onUpdateState?: TSetProcessState;
}) => {
  if (!Array.isArray(files) || files.length === 0) {
    if (allowEmpty) return;

    throw new Error("no files to upload");
  }

  console.log({ files });

  // init data to upload
  const formData = new FormData();
  files.forEach((f) => {
    formData.append("files", f.originFileObj as File);
  });
  onUpdateState?.("loading")("sending new request to upload files...");
  const newFilesResult = await uploadFile(formData);
  if (newFilesResult.error || !newFilesResult.data) {
    throw new Error(
      newFilesResult.error || "unknown error when push files to Blueprint!"
    );
  }

  const { bizFolder, lstFlNm } = newFilesResult.data;
  const filesPayload = lstFlNm
    .map((filename, index) => {
      if (!files[index]) return null;
      return {
        name: filename,
        size: `${Math.round(((files[index].size || 0) / 1024) * 10) / 10} KB`,
        url: path.join("/", bizFolder || "", filename),
      };
    })
    .filter((item) => item) as TFileUploadInfo[];
  const filesInTaskResult = await addFilesToTask(
    taskId,
    filesPayload,
    bizFolder
  );
  if (filesInTaskResult.error || !filesInTaskResult.data) {
    throw new Error(
      filesInTaskResult.error || "unknown error when push files to task"
    );
  }

  return {
    bizFolder,
    filenames: lstFlNm,
    addToTaskResult: filesInTaskResult.data,
  };
};
