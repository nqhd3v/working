import { Modal, ModalProps } from "antd";
import IssueTypesForm from "./issue-types.form";

const ConfPhaseAssignerByIssueType: React.FC<
  Omit<ModalProps, "title" | "children" | "footer" | "width" | "onCancel"> & {
    onCancel?: () => void;
  }
> = ({ open, onCancel, ...props }) => {
  return (
    <Modal
      title="Configure for assigner by phases when create new task on Blueprint"
      width="calc(100% - 40px)"
      style={{ ...(props.style || {}), maxWidth: 800 }}
      footer={null}
      open={open}
      onCancel={() => onCancel?.()}
      {...props}
    >
      {open ? <IssueTypesForm onDone={() => onCancel?.()} /> : null}
    </Modal>
  );
};

export default ConfPhaseAssignerByIssueType;
