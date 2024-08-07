import { Modal, ModalProps } from "antd";
import React from "react";
import SetDefaultConfTask from "./conf-task.form";
import SetDefaultData from "./conf-default.form";

const ModalBlpTaskConf: React.FC<Omit<ModalProps, "title" | "children">> = (
  props
) => {
  return (
    <Modal
      title="Configure for BLP Task"
      width="calc(100% - 40px)"
      style={{ maxWidth: 1000 }}
      footer={null}
      {...props}
    >
      {props.open ? <ModalContent /> : null}
    </Modal>
  );
};

const ModalContent = () => (
  <>
    <SetDefaultData />
    <SetDefaultConfTask />
  </>
);

export default ModalBlpTaskConf;
