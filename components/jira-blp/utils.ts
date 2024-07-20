import { SelectProps } from "antd";
import dayjs, { Dayjs } from "dayjs";

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
