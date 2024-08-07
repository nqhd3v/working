import {
  TGroupedCategory,
  TProjectTransformed,
} from "@nqhd3v/crazy/types/blueprint";
import {
  TBoardJira,
  TJiraIssue,
  TJiraIssueType,
  TSprintJira,
  TWorklog,
} from "@nqhd3v/crazy/types/jira";
import { SelectProps } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { get } from "lodash";
import { COLOR_PALETTE } from "./constant";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { TMappingWorkHourCase } from "@/types/blp";

dayjs.extend(utc);
dayjs.extend(timezone);

export const mapJiraBoardsToOptions = (
  boards: TBoardJira[]
): SelectProps["options"] =>
  boards.map((b) => ({
    label: (
      <>
        <span className="text-gray-400 font-bold">{b.id}</span>
        {" - "}
        {b.name}
        {" - "}
        <span className="text-gray-400">
          <span className="font-bold">Project ID:</span> {b.location.projectId}
        </span>
      </>
    ),
    value: b.id,
  }));

export const mapJiraIssueTypesToOptions = (
  issueTypes: TJiraIssueType[]
): SelectProps["options"] =>
  issueTypes.map((i) => ({
    label: i.name,
    value: i.id,
  }));

export const mapBlpProjectToOptions = (
  projects: TProjectTransformed[]
): SelectProps["options"] =>
  projects.map((p) => ({
    label: p.name,
    value: p.id,
  }));

export const mapBlpCategoryToOptions = (
  category: TGroupedCategory
): SelectProps["options"] =>
  category.map((c) => ({
    title: c.pjtNm,
    label: c.pjtNm,
    options: c.subItems.map((i) => ({
      label: i.pjtNm,
      value: i.pjtId,
    })),
  }));

export const mapJiraSprintToOptions = (
  sprints: TSprintJira[]
): SelectProps["options"] => {
  return [...sprints]
    .sort((a, b) => (dayjs(a.startDate).isBefore(dayjs(b.startDate)) ? 1 : -1))
    .map((s) => ({
      label: (
        <span className="text-gray-400">
          <span className="font-bold">{s.name}</span>
          {" - "}
          <span>{s.state}</span>
        </span>
      ),
      value: s.id,
    }));
};

export const generateBlpTaskTitleByFormat = (
  data: TJiraIssue,
  format: string[]
) => {
  return format
    .map((key) =>
      key.startsWith("$.") ? get(data, key.replace("$.", "")) : key
    )
    .join("");
};

export const generateIssueTypeColors = (issueTypes: TJiraIssueType[]) => {
  return issueTypes.reduce(
    (res: Record<TJiraIssueType["id"], string>, cur, index) => {
      if (res[cur.id]) return res;

      res[cur.id] = COLOR_PALETTE[index];
      return res;
    },
    {}
  );
};

export const jiraTime = (time: string) =>
  dayjs(time).tz("Asia/Ho_Chi_Minh").clone();

export const convertJiraTimeToHours = (
  timeString?: string,
  hoursPerDay: number = 8,
  daysPerWeek: number = 5
): number | null => {
  if (!timeString || !isValidTimeStrFormat(timeString)) return null;

  const units: Record<string, number> = {
    w: daysPerWeek * hoursPerDay,
    d: hoursPerDay,
    h: 1,
    m: 1 / 60,
  };

  const regex = /(\d+)([wdhm])/g;
  let totalHours = 0;

  let match;
  while ((match = regex.exec(timeString)) !== null) {
    const [, value, unit] = match;
    totalHours += parseInt(value) * units[unit];
  }

  return totalHours;
};

export const minsToJiraTime = (
  totalMins: number,
  hoursPerDay: number = 8,
  workDaysPerWeek: number = 5
): string => {
  const weeklyWorkMins = workDaysPerWeek * hoursPerDay * 60;
  const dailyWorkMins = hoursPerDay * 60;

  const weeks = Math.floor(totalMins / weeklyWorkMins);
  let remainingMins = totalMins % weeklyWorkMins;

  const days = Math.floor(remainingMins / dailyWorkMins);
  remainingMins =
    days > 0 ? remainingMins % (days * dailyWorkMins) : remainingMins;

  const hours = Math.floor(remainingMins / 60);
  remainingMins = hours > 0 ? remainingMins % (hours * 60) : remainingMins;

  const minutes = Math.round(remainingMins);

  return [
    weeks > 0 ? `${weeks}w` : undefined,
    days > 0 ? `${days}d` : undefined,
    hours > 0 ? `${hours}h` : undefined,
    minutes > 0 ? `${minutes}m` : undefined,
  ]
    .filter((item) => item)
    .join(" ");
};

export const generateTaskWorkingTimes = (
  worklogs: TWorklog[],
  hrsPerDay: number
): { date: Dayjs; time: string }[] => {
  return worklogs.map((log) => ({
    date: jiraTime(log.started).startOf("day"),
    time: minsToJiraTime(log.timeSpentSeconds / 60, hrsPerDay),
  }));
};

export const isValidTimeStrFormat = (time: string): boolean =>
  /^(\d+w\s*)?(\d+d\s*)?(\d+h\s*)?(\d+m\s*)?$/.test(time);

export const htmlToText = (html: string): string => {
  const temp = document.createElement("div");
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || "";
};
