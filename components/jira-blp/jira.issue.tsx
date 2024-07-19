import { useJiraStore } from "@/stores/jira";
import { getJiraIssues } from "@/utils/jira.request";
import { TJiraIssue } from "@nqhd3v/crazy/types/jira";
import { useSetState } from "ahooks";
import { Table, TableProps, Tag } from "antd";
import { TableRowSelection } from "antd/es/table/interface";
import { useEffect, useState } from "react";

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
  const board = useJiraStore.useSelectedBoard();
  const sprint = useJiraStore.useSelectedSprint();
  const issueTypes = useJiraStore.useSelectedIssueTypes();
  const [{ loading, issues }, setStates] = useSetState<{
    loading: boolean;
    issues: TJiraIssue[];
    selectedIssues: TJiraIssue[];
  }>({
    loading: false,
    issues: [],
    selectedIssues: [],
  });

  const handleGetIssues = async () => {
    if (!sprint || !issueTypes) return;

    await getJiraIssues({
      sprintId: sprint.id,
      issueTypes: issueTypes.map((i) => i.id),
      onLoading: (s) => setStates({ loading: s }),
      callback: (i) => setStates({ issues: i }),
    });
  };

  const handleSelectRows: TableRowSelection<any>["onChange"] = (_, rows) => {
    setStates({ selectedIssues: rows });
  };

  useEffect(() => {
    handleGetIssues();
  }, [sprint?.id]);

  return (
    <Table
      columns={JIRA_BLP_COLUMNS}
      loading={loading}
      dataSource={issues}
      rowSelection={{
        onChange: handleSelectRows,
      }}
      pagination={false}
    />
  );
};

export default JiraIssuesTable;
