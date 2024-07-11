"use client";
import { filter, find } from "lodash";
import { Button, Form, FormProps, notification, Select } from "antd";
import React, { useState } from "react";
import { useJira, useJiraDefaultData } from "./context";
import { $client } from "@/utils/request";
import { TJiraIssue } from "@nqhd3v/crazy/types/jira";
import {
  mapJiraBoardsToOptions,
  mapJiraIssueTypesToOptions,
} from "@/utils/mapping-data";
import { JIRA_CONF_BOARD_ID, JIRA_CONF_ISSUE_TYPE_IDS } from "@/utils/constant";
import ModalTestData from "./modal-test-data";

const JiraDefaultInfo: React.FC<{ loading?: boolean }> = ({ loading }) => {
  const [form] = Form.useForm();
  const {
    user,
    initializing,
    board: selectedBoard,
    issueTypes: selectedIssueTypes,
    setLoadingStep,
    setCurrentStep,
    setBoard,
    setIssueTypes: setSelectedIssueTypes,
  } = useJira();
  const {
    loading: loadingDefaultData,
    boardData,
    issueTypeData,
    getIssueTypes,
  } = useJiraDefaultData();
  const [testIssues, setTestIssues] = useState<TJiraIssue[]>([]);
  const [loadingTest, setLoadingTest] = useState(false);
  const handleTest = async () => {
    setLoadingTest(true);
    try {
      const values = await form.validateFields();
      const res = await $client("jira/issues", {
        params: {
          boardId: values.board,
          issueTypes: values.issuetypes.join(","),
        },
      });

      if (!res.data.issues || res.data.error) {
        return notification.warning({
          message:
            res.data.error || "no active sprint found (or auth info is wrong)!",
        });
      }

      setTestIssues(res.data.issues);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTest(false);
    }
  };
  const handleSave: FormProps["onFinish"] = ({ board, issuetypes }) => {
    setBoard(board);
    setSelectedIssueTypes(issuetypes);
    localStorage.setItem(JIRA_CONF_BOARD_ID, board);
    localStorage.setItem(JIRA_CONF_ISSUE_TYPE_IDS, issuetypes.join(","));
    setCurrentStep((prev) => (prev += 1));
  };

  const handlePickBoard = async (boardId: string | number) => {
    form.setFieldValue("issuetypes", []);
    setLoadingStep(true);
    getIssueTypes(boardId);
    setLoadingStep(false);
  };

  if (initializing || loadingDefaultData) {
    return <div className="text-gray-400">initializing data...</div>;
  }

  if (selectedBoard && selectedIssueTypes.length) {
    const boardName = find(boardData, (b) => b.id === selectedBoard)?.name;
    const issueTypeNames = filter(issueTypeData, (i) =>
      selectedIssueTypes.includes(i.id)
    )?.map((i) => `"${i.name}"`);
    return (
      <div>
        <div className="text-gray-400 text-sm">
          {"set board "}
          <span className="font-bold">&quot;{boardName}&quot;</span>
          {" and issue-types "}
          <span className="font-bold">{issueTypeNames.join(", ")}</span>
          {" as default"}
        </div>
        <div
          className="text-blue-400 cursor-pointer font-bold underline"
          onClick={() => {
            setBoard(null);
            setSelectedIssueTypes([]);
            localStorage.removeItem(JIRA_CONF_BOARD_ID);
            localStorage.removeItem(JIRA_CONF_ISSUE_TYPE_IDS);
          }}
        >
          pick other
        </div>
      </div>
    );
  }

  return (
    <>
      <Form
        layout="vertical"
        form={form}
        onFinish={handleSave}
        initialValues={{ board: selectedBoard, issuetypes: selectedIssueTypes }}
      >
        <Form.Item
          name="board"
          label="Board"
          rules={[{ required: true, message: "pick board!" }]}
        >
          <Select
            options={mapJiraBoardsToOptions(boardData)}
            onChange={handlePickBoard}
          />
        </Form.Item>
        <Form.Item
          noStyle
          shouldUpdate={(prev, cur) => prev.board !== cur.board}
        >
          {({ getFieldValue }) => {
            const board = getFieldValue("board");
            return (
              <Form.Item
                name="issuetypes"
                label="Issue types"
                rules={[{ required: true, message: "pick issue type" }]}
              >
                <Select
                  options={mapJiraIssueTypesToOptions(issueTypeData)}
                  mode="tags"
                  disabled={!board}
                />
              </Form.Item>
            );
          }}
        </Form.Item>
        <div className="flex items-center gap-5">
          <Button
            type="dashed"
            htmlType="button"
            onClick={() => handleTest()}
            loading={loadingTest}
          >
            Test
          </Button>
          <Button type="primary" htmlType="submit">
            Finish
          </Button>
        </div>
        <div className="pt-3 text-gray-400 italic">
          In my case, I select <code>Sub-Imp</code>, <code>Sub-Bug</code> and{" "}
          <code>Sub Overhead</code> (based on your project or configuration by
          Scrum Master). I don&#39;t select <code>Task</code> or{" "}
          <code>Bug</code> because they are big issues, that will assigned to
          the PIC, not the person who implemented.
        </div>
      </Form>
      <ModalTestData
        open={testIssues.length > 0}
        onCancel={() => setTestIssues([])}
        items={testIssues}
      />
    </>
  );
};

export default JiraDefaultInfo;
