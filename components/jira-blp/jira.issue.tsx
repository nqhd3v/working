import { useAppConfStore } from "@/stores/app-conf";
import { useJiraStore } from "@/stores/jira";
import { getJiraIssues } from "@/utils/jira.request";
import { TJiraIssue } from "@nqhd3v/crazy/types/jira";
import { useSetState } from "ahooks";
import { notification, Skeleton, Table, TableProps, Tag } from "antd";
import React, { useEffect, useState } from "react";
import BlpNewTasks from "./blp-task";
import { useBlpStore } from "@/stores/blueprint";
import { getTasksByJob } from "@/app/actions/blueprint";
import { BLP_REQUIREMENT_STATE_START_WITH } from "@/utils/constant";
import { useBlueprintTasks } from "@/hooks/use-blp-tasks";

const JIRA_BLP_COLUMNS: TableProps<TJiraIssue>["columns"] = [
  {
    title: "Content",
    dataIndex: "fields.summary",
    width: 600,
    render: (_, record) => {
      return (
        <>
          <div className="text-gray-600 font-bold">{record.fields.summary}</div>
          <div className="text-gray-400 text-xs">
            {record.fields.description}
          </div>
        </>
      );
    },
  },
  {
    title: "Type",
    dataIndex: "",
    width: 120,
    align: "center",
    render: (_, record) => {
      return <Tag>{record.fields.issuetype?.name}</Tag>;
    },
  },
];

const JiraIssuesTable = () => {
  const sampleJiraIssue = useAppConfStore.useSampleJiraIssue();
  const setSampleJiraIssue = useAppConfStore.useUpdateSampleJiraIssue();
  const setLoading = useJiraStore.useUpdateLoadingIssues();
  const sprint = useJiraStore.useSelectedSprint();
  const issueTypes = useJiraStore.useSelectedIssueTypes();
  const { issues: loadingIssues } = useJiraStore.useLoading();
  useBlueprintTasks({ autoRun: true });

  const [issues, setStates] = useState<TJiraIssue[]>([]);

  const handleGetIssues = async () => {
    if (!sprint || !issueTypes) return;

    await getJiraIssues({
      sprintId: sprint.id,
      issueTypes: issueTypes.map((i) => i.id),
      onLoading: (s) => setLoading(s),
      callback: async (i) => {
        setStates(i);
        if (!sampleJiraIssue && i.length > 0) setSampleJiraIssue(i[0]);
      },
    });
  };

  useEffect(() => {
    handleGetIssues();
  }, [sprint?.id]);

  if (loadingIssues) {
    return <Skeleton active />;
  }
  return <BlpNewTasks items={issues} />;
};

export default JiraIssuesTable;
