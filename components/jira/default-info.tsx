"use client";
import React from "react";
import { useJira } from "./context";
import { useJiraStore } from "@/stores/jira";
import JiraDefaultInfoForm from "./default-info-form";

const JiraDefaultInfo = () => {
  const user = useJiraStore.useUser();
  const selectedBoard = useJiraStore.useSelectedBoard();
  const selectedIssueTypes = useJiraStore.useSelectedIssueTypes();
  const {
    states: { initializing, loadingBoard, loadingIssueType },
    reset,
  } = useJira();

  if (
    initializing ||
    (selectedBoard &&
      selectedIssueTypes &&
      selectedIssueTypes.length &&
      (loadingBoard || loadingIssueType))
  ) {
    return <div className="text-xs text-gray-400">initializing data...</div>;
  }

  if (!user) {
    return <div className="text-xs text-gray-400">authenticate first</div>;
  }

  if (selectedBoard && selectedIssueTypes && selectedIssueTypes.length) {
    return (
      <div>
        <div className="text-gray-400 text-xs">
          {"set board "}
          <span className="font-bold">&quot;{selectedBoard.name}&quot;</span>
          {" and issue-types "}
          <span className="font-bold">
            {selectedIssueTypes.map((i) => i.name).join(", ")}
          </span>
          {" as default"}
        </div>
        <div
          className="text-blue-400 cursor-pointer font-bold underline"
          onClick={() => reset()}
        >
          pick other
        </div>
      </div>
    );
  }

  return <JiraDefaultInfoForm />;
};

export default JiraDefaultInfo;
