import { Button, DatePicker, Form, FormListOperation } from "antd";
import InputWorkTime from "./input-work-time";
import { NamePath } from "antd/es/form/interface";
import { CopyOutlined, DeleteOutlined } from "@ant-design/icons";

const FormItemWorkingTime: React.FC<{
  fieldKey: number;
  add: FormListOperation["add"];
  remove: FormListOperation["remove"];
}> = ({ fieldKey, add, remove }) => {
  return (
    <div className="p-3 rounded bg-gray-100 mb-3 last:mb-0">
      <Form.Item
        name={[fieldKey, "date"]}
        className="col-span-4 !mb-3"
        rules={[{ required: true, message: "" }]}
      >
        <DatePicker format="DD/MM/YYYY" className="w-full" />
      </Form.Item>

      <div className="grid grid-cols-6 gap-3">
        <Form.Item
          name={[fieldKey, "time"]}
          className="col-span-4 !mb-0"
          rules={[{ required: true, message: "" }]}
        >
          <InputWorkTime />
        </Form.Item>
        <Form.Item className="flex items-center justify-end gap-3 col-span-2 !mb-0">
          <TaskWorkingTimeActions
            name={["workingTimes", fieldKey]}
            onAdd={add}
            onRemove={() => remove(fieldKey)}
          />
        </Form.Item>
      </div>
    </div>
  );
};

export const TaskWorkingTimeActions: React.FC<{
  name: NamePath;
  onAdd: FormListOperation["add"];
  onRemove: () => void;
}> = ({ name, onAdd, onRemove }) => {
  const form = Form.useFormInstance();

  const handleCopy = () => {
    console.log({ name });
    const values = form.getFieldValue(name);
    onAdd(values);
  };

  return (
    <>
      <Button icon={<CopyOutlined />} onClick={() => handleCopy()} />
      <Button
        icon={<DeleteOutlined />}
        type="primary"
        className="ml-2"
        danger
        onClick={() => onRemove()}
      />
    </>
  );
};

export default FormItemWorkingTime;
