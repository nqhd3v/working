import {
  TBoardJira,
  TJiraIssue,
  TJiraIssueType,
  TSprintJira,
  TUserJira,
} from "@nqhd3v/crazy/types/jira";
import { $client } from "./request";

type TJiraRequestProps<T = any> = {
  onLoading?: (loading: boolean) => void;
  callback: (data: T) => void | Promise<void>;
};

export const getJiraBoards = async ({
  onLoading,
  callback,
}: TJiraRequestProps<TBoardJira[]>) => {
  onLoading?.(true);
  try {
    const res = await $client<{ boards: TBoardJira[] }>("jira/boards");

    if (!Array.isArray(res.data.boards)) {
      return;
    }
    await callback?.(res.data.boards);
  } catch (e) {
    console.error(e);
  } finally {
    onLoading?.(false);
  }
};

export const getJiraIssueTypeByBoard = async ({
  boardId,
  onLoading,
  callback,
}: TJiraRequestProps<TJiraIssueType[]> & { boardId: string | number }) => {
  onLoading?.(true);
  try {
    const res = await $client<{ issueTypes: TJiraIssueType[] }>(
      `jira/boards/${boardId}/issue-types`
    );

    if (!Array.isArray(res.data.issueTypes)) return;
    await callback(res.data.issueTypes);
  } catch (e) {
    console.error(e);
  } finally {
    onLoading?.(false);
  }
};

export const getJiraIssues = async ({
  boardId,
  sprintId,
  issueTypes,
  onLoading,
  callback,
}: TJiraRequestProps<TJiraIssue[]> & {
  boardId?: string | number;
  sprintId?: string | number;
  issueTypes: string[];
}) => {
  onLoading?.(true);
  try {
    if (!boardId && !sprintId) return;
    const url = sprintId
      ? `jira/sprints/${sprintId}/issues`
      : `jira/boards/${boardId}/issues`;
    const res = await $client<{ issues: TJiraIssue[] }>(url, {
      params: {
        issueTypes: issueTypes.join(","),
      },
    });

    if (!Array.isArray(res.data.issues)) return;
    await callback(res.data.issues);
  } catch (e) {
    console.error(e);
  } finally {
    onLoading?.(false);
  }
};

export const getJiraSprints = async ({
  boardId,
  onLoading,
  callback,
}: TJiraRequestProps<TSprintJira[]> & {
  boardId: string | number;
}) => {
  onLoading?.(true);
  try {
    const res = await $client<{ sprints: TSprintJira[] }>(
      `jira/boards/${boardId}/sprints`
    );

    if (!Array.isArray(res.data.sprints)) return;

    callback(res.data.sprints);
  } catch (e) {
    console.error(e);
  } finally {
    onLoading?.(false);
  }
};

export const getJiraUser = async ({
  email,
  pat,
  onLoading,
  callback,
}: TJiraRequestProps<TUserJira> & {
  email: string;
  pat: string;
}) => {
  onLoading?.(true);
  try {
    const res = await $client.post<{ user: TUserJira }>("jira/auth", {
      email,
      pat,
    });

    callback(res.data.user || null);
  } catch (e) {
    console.error("error when get user info", e);
  } finally {
    onLoading?.(false);
  }
};
