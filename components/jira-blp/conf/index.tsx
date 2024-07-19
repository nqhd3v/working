import { SettingOutlined } from "@ant-design/icons";
import { useSetState } from "ahooks";
import { Button, Dropdown } from "antd";
import ModalBlpTaskConf from "./blp-task-conf.modal";
import ModalBiWeeklyReport from "./bi-weekly-rp.modal";

const BlpJiraConf = () => {
  const [{ isOpenConfBlpTask }, setStates] = useSetState<{
    isOpenConfBlpTask: boolean;
  }>({ isOpenConfBlpTask: false });

  return (
    <>
      <Dropdown
        menu={{
          items: [
            {
              key: "dropdown--conf-blp-task",
              label: "Configure BLP TASK",
              onClick: () => {
                setStates({ isOpenConfBlpTask: true });
              },
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
    </>
  );
};

export default BlpJiraConf;
