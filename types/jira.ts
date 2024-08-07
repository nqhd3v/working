import { TJiraIssueType } from "@nqhd3v/crazy/types/jira";

export type TAuthJira = {
  email: string;
  pat: string;
};

export type TJiraIssueTypeColors = Record<TJiraIssueType["id"], string>;
