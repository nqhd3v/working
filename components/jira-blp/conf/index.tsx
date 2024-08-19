import { SettingOutlined } from "@ant-design/icons";
import { useSetState } from "ahooks";
import { Button, Dropdown, Tooltip } from "antd";
import ModalBlpTaskConf from "./blp-task-conf-modal";
import { useTourGuideRefs } from "@/components/tour-guide";

const BlpJiraConf = () => {
  const [{ isOpenConfBlpTask }, setStates] = useSetState<{
    isOpenConfBlpTask: boolean;
  }>({ isOpenConfBlpTask: false });
  const { jiraIssueConf } = useTourGuideRefs();

  return (
    <>
      <Tooltip title="Configure for Blueprint task" placement="left">
        <Button
          onClick={() => setStates({ isOpenConfBlpTask: true })}
          icon={<SettingOutlined />}
          ref={jiraIssueConf}
        />
      </Tooltip>

      {/* MODAL */}
      <ModalBlpTaskConf
        open={isOpenConfBlpTask}
        onCancel={() => setStates({ isOpenConfBlpTask: false })}
      />
    </>
  );
};

export default BlpJiraConf;
