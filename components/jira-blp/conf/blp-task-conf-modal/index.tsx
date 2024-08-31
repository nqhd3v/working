import { Modal, ModalProps } from "antd";
import React from "react";
import SetDefaultConfTask from "./conf-task.form";

const ModalBlpTaskConf: React.FC<Omit<ModalProps, "title" | "children">> = (
  props
) => {
  return (
    <Modal
      title="Configure for BLP Task"
      width="calc(100% - 40px)"
      style={{ maxWidth: 720 }}
      footer={null}
      {...props}
    >
      {props.open ? <SetDefaultConfTask /> : null}
    </Modal>
  );
};

export default ModalBlpTaskConf;
