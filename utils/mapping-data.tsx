import {
  TGroupedCategory,
  TProjectTransformed,
} from "@nqhd3v/crazy/types/blueprint";
import { TBoardJira, TJiraIssueType } from "@nqhd3v/crazy/types/jira";
import { SelectProps } from "antd";

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