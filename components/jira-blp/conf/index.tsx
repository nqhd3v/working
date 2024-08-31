import { SettingOutlined } from "@ant-design/icons";
import { useSetState } from "ahooks";
import { Button, Dropdown, Tooltip } from "antd";
import ModalBlpTaskConf from "./blp-task-conf-modal";
import { useTourGuideRefs } from "@/components/tour-guide";
import ConfPhaseAssignerByIssueType from "./conf-phase-assigner";

const BlpJiraConf = () => {
  const [{ isOpenConfBlpTask, isOpenConfPhaseAssigner }, setStates] =
    useSetState<{
      isOpenConfBlpTask: boolean;
      isOpenConfPhaseAssigner: boolean;
    }>({ isOpenConfBlpTask: false, isOpenConfPhaseAssigner: false });
  // const { jiraIssueConf } = useTourGuideRefs();

  return (
    <>
      <Dropdown
        menu={{
          items: [
            {
              label: "Configure task's info by issue-type",
              type: "item",
              key: "conf-by-issue-type",
              onClick: () => setStates({ isOpenConfPhaseAssigner: true }),
            },
            {
              label: "Configure new task's content",
              type: "item",
              key: "conf-register-new-task",
              onClick: () => setStates({ isOpenConfBlpTask: true }),
            },
          ],
        }}
      >
        <Button icon={<SettingOutlined />} />
      </Dropdown>

      {/* MODAL */}
      <ModalBlpTaskConf
        open={isOpenConfBlpTask}
        onCancel={() => setStates({ isOpenConfBlpTask: false })}
      />
      <ConfPhaseAssignerByIssueType
        open={isOpenConfPhaseAssigner}
        onCancel={() => setStates({ isOpenConfPhaseAssigner: false })}
      />
    </>
  );
};

export default BlpJiraConf;
