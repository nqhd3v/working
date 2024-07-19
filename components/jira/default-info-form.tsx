import { Button, Form, FormProps, Select } from "antd";
import ModalTestData from "./modal-test-data";
import {
  mapJiraBoardsToOptions,
  mapJiraIssueTypesToOptions,
} from "@/utils/mapping-data";
import { find } from "lodash";
import { useState } from "react";
import { useJiraStore } from "@/stores/jira";
import { useJira } from "./context";

const JiraDefaultInfoForm = () => {
  const [form] = Form.useForm();
  const selectedBoard = useJiraStore.useSelectedBoard();
  const selectedIssueTypes = useJiraStore.useSelectedIssueTypes();
  const {
    states: {
      initializing,
      boards,
      issueTypes,
      loadingBoard,
      loadingIssueType,
    },
    setStates,
    getIssueTypes,
    getIssues,
    getSprints,
  } = useJira();
  const [isOpenTestModal, setOpenTestModal] = useState(false);
  const setSelectedBoard = useJiraStore.useUpdateSelectedBoard();
  const setSelectedIssueTypes = useJiraStore.useUpdateSelectedIssueTypes();

  if (
    initializing ||
    (selectedBoard &&
      selectedIssueTypes &&
      selectedIssueTypes.length &&
      (loadingBoard || loadingIssueType))
  ) {
    return <div className="text-xs text-gray-400">initializing data...</div>;
  }

  const handleSave: FormProps["onFinish"] = async ({ board, issuetypes }) => {
    setStates((prev) => ({
      ...prev,
      currentStep: prev.currentStep + 1,
    }));
    setSelectedBoard(find(boards, ({ id }) => id === board) || null);
    const issueTypesData = issueTypes.filter(({ id }) =>
      issuetypes.includes(id)
    );
    setSelectedIssueTypes(issueTypesData);
    // retrieve sprints data with board saved
    await getSprints(board);
  };

  const handlePickBoard = async (boardId: string | number) => {
    form.setFieldValue("issuetypes", []);
    await getIssueTypes(boardId);
  };

  const handleTest = async () => {
    try {
      const { board, issuetypes } = await form.validateFields();
      setOpenTestModal(true);
      await getIssues(board, issuetypes);
    } catch (e) {}
  };

  return (
    <>
      <Form
        layout="vertical"
        form={form}
        onFinish={handleSave}
        initialValues={{
          board: selectedBoard?.id,
          issuetypes: selectedIssueTypes?.map((i) => i.id) || [],
        }}
      >
        <Form.Item
          name="board"
          label="Board"
          rules={[{ required: true, message: "pick board!" }]}
        >
          <Select
            options={mapJiraBoardsToOptions(boards)}
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
                  options={mapJiraIssueTypesToOptions(issueTypes)}
                  mode="tags"
                  disabled={!board}
                  loading={loadingIssueType}
                />
              </Form.Item>
            );
          }}
        </Form.Item>
        <div className="flex items-center gap-5">
          <Button type="dashed" htmlType="button" onClick={() => handleTest()}>
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
        open={isOpenTestModal}
        onCancel={() => {
          setOpenTestModal(false);
          setStates({ issues: [], loadingIssue: false });
        }}
      />
    </>
  );
};

export default JiraDefaultInfoForm;
