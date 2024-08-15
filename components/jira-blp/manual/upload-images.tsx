import {
  Button,
  Form,
  FormProps,
  Modal,
  ModalProps,
  notification,
  UploadFile,
} from "antd";
import { addFilesToTask, uploadFile } from "@/app/actions/blueprint";
import { useEffect, useState } from "react";
import { TFileUploadInfo } from "@nqhd3v/crazy/types/blueprint";
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import path from "path";
import InputTaskId from "../components/input-task-id";
import UploadDragDrop from "../components/upload-drag-drop";

const UploadImagesModal: React.FC<
  Omit<ModalProps, "children" | "title" | "footer">
> = (props) => {
  const [form] = Form.useForm();
  const [state, setState] = useState<{
    state: "loading" | "error" | "done";
    message: string;
  } | null>(null);

  const handleUpload: FormProps<{
    taskId: string;
    files: UploadFile[];
  }>["onFinish"] = async ({ taskId, files }) => {
    const formData = new FormData();
    files.forEach((f) => {
      formData.append("files", f.originFileObj as File);
    });
    setState({ state: "loading", message: "preparing..." });

    const fileResult = await uploadFile(formData);
    if (fileResult.error || !fileResult.data) {
      setState({ state: "error", message: "upload files failed!" });
      notification.error({
        message:
          fileResult.error ||
          "something went wrong when upload file to Blueprint",
      });
      return;
    }
    setState({ state: "loading", message: "adding files to task..." });
    const filesPayload = fileResult.data.lstFlNm
      .map((fileName) => {
        const current = files.find((f) => f.name === fileName);
        if (!current) return null;
        return {
          name: fileName,
          size: `${Math.round(((current.size || 0) / 1024) * 10) / 10} KB`,
          url: path.join("/", fileResult.data?.bizFolder || "", fileName),
        };
      })
      .filter((item) => item) as TFileUploadInfo[];
    const fileMgnt = await addFilesToTask(
      taskId,
      filesPayload,
      fileResult.data.bizFolder
    );
    console.log(fileMgnt);

    if (fileMgnt.error || !fileMgnt.data) {
      setState({ state: "error", message: "add files to task failed!" });
      notification.error({
        message:
          fileMgnt.error || "somethings went wrong when add files to task!",
      });
      return;
    }

    setState({ state: "done", message: "added file to task successfully!" });
  };

  useEffect(() => {
    setState(null);
  }, [props.open]);

  const renderState = () => {
    if (!state) return null;
    if (state.state === "loading") {
      return (
        <div className="flex items-center gap-5">
          <LoadingOutlined spin />
          <span>{state.message}</span>
        </div>
      );
    }
    if (state.state === "error") {
      return (
        <div className="flex items-center gap-5">
          <ExclamationCircleOutlined className="!text-red-400" />
          <span>{state.message}</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-5">
        <CheckCircleOutlined className="!text-green-700" />
        <span>{state.message}</span>
      </div>
    );
  };

  useEffect(() => {
    form.resetFields();
  }, [props.open]);

  return (
    <Modal title="Upload images for task" footer={null} {...props}>
      <Form
        form={form}
        onFinish={handleUpload}
        initialValues={{ files: [] }}
        layout="vertical"
      >
        <Form.Item name="taskId" label="Task ID">
          <InputTaskId />
        </Form.Item>
        <Form.Item name="files">
          <UploadDragDrop />
        </Form.Item>
        <Button type="primary" htmlType="submit">
          Upload images
        </Button>
      </Form>
      {renderState()}
    </Modal>
  );
};

export default UploadImagesModal;
