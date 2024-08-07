import { Button, Dropdown } from "antd";
import UploadImagesModal from "./upload-images";
import { useSetState } from "ahooks";
import AddWorklogModal from "./add-worklog";

const ManualDropdown = () => {
  const [{ openUploadModal, openAddWorklogModal }, setStates] = useSetState<{
    openUploadModal: boolean;
    openAddWorklogModal: boolean;
  }>({
    openUploadModal: false,
    openAddWorklogModal: false,
  });

  return (
    <>
      <Dropdown
        menu={{
          items: [
            {
              key: "dropdown--task--upload-images",
              label: "Upload images for task",
              onClick: () => setStates({ openUploadModal: true }),
            },
            {
              key: "dropdown--task--add-worklog",
              label: "Add worklogs for task",
              onClick: () => setStates({ openAddWorklogModal: true }),
            },
          ],
        }}
      >
        <Button>Manual</Button>
      </Dropdown>

      <UploadImagesModal
        open={openUploadModal}
        onCancel={() => setStates({ openUploadModal: false })}
      />
      <AddWorklogModal
        open={openAddWorklogModal}
        onCancel={() => setStates({ openAddWorklogModal: false })}
      />
    </>
  );
};

export default ManualDropdown;
