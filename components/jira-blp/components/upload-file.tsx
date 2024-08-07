import { PlusOutlined } from "@ant-design/icons";
import { Image, Upload, UploadFile } from "antd";
import { useState } from "react";

const UploadImagesForTask: React.FC<{
  onChange?: (files: UploadFile[]) => void;
  value?: UploadFile[];
}> = ({ value, onChange }) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  const uploadButton = (
    <button className="bg-none border-0" type="button">
      <PlusOutlined />
      <div className="mt-2">Upload</div>
    </button>
  );
  return (
    <>
      <Upload
        listType="picture-card"
        fileList={value}
        onChange={({ fileList }) => onChange?.(fileList)}
        beforeUpload={() => false}
      >
        {!Array.isArray(value) || value.length > 8 ? null : uploadButton}
      </Upload>
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

export default UploadImagesForTask;
