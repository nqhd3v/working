import { Modal, ModalProps } from "antd";
import React from "react";

const ModalBlpTaskConf: React.FC<Omit<ModalProps, "title" | "children">> = (
  props
) => {
  return <Modal title="Configure for BLP Task" {...props}></Modal>;
};

export default ModalBlpTaskConf;
