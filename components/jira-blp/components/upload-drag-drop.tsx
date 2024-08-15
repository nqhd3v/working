import { Image, UploadFile } from "antd";
import Dragger, { DraggerProps } from "antd/es/upload/Dragger";
import { useState } from "react";

const UploadDragDrop: React.FC<
  Omit<DraggerProps, "onChange" | "beforeUpload" | "fileList"> & {
    onChange?: (fileList: UploadFile[]) => void;
    value?: UploadFile[];
  }
> = ({ onChange, value = [] }) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  return (
    <>
      <Dragger
        onChange={({ fileList }) => onChange?.(fileList)}
        beforeUpload={() => false}
        listType="picture-card"
        fileList={value}
        rootClassName="upload-drag-drop"
      >
        click or drop image(s) here
      </Dragger>
      {previewImage && (
        <Image
          wrapperStyle={{ display: "none" }}
          preview={{
            visible: previewOpen,
            onVisibleChange: (visible) => setPreviewOpen(visible),
            afterOpenChange: (visible) => !visible && setPreviewImage(""),
          }}
          src={previewImage}
          alt="preview"
        />
      )}
    </>
  );
};

export default UploadDragDrop;
