import {
  Alert,
  Button,
  Checkbox,
  Form,
  FormProps,
  List,
  Modal,
  ModalProps,
  notification,
} from "antd";
import { useEffect, useState } from "react";
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import InputTaskId from "../components/input-task-id";
import dayjs from "dayjs";
import {
  TBlpTaskEffort,
  TBlpTaskJob,
  TProjectTransformed,
} from "@nqhd3v/crazy/types/blueprint";
import { TTaskDetail } from "@/types/blp";
import { minsToJiraTime } from "@/utils/mapping-data";
import { getTaskJobs } from "@/app/actions/blueprint";
import { useBlpStore } from "@/stores/blueprint";
import FormItemWorkingTime from "../components/form-item-work-time";
import { useBlueprintTasks } from "@/hooks/use-blp-tasks";
import { updateWorklogs } from "../handlers";
import useProcess from "@/hooks/use-process";

const AddWorklogModal: React.FC<
  Omit<ModalProps, "children" | "title" | "footer">
> = (props) => {
  const project = useBlpStore.useSelectedProject();
  const category = useBlpStore.useSelectedCategory();
  const [form] = Form.useForm();
  const { content, setState } = useProcess();
  const [actualEfforts, setEfforts] = useState<TBlpTaskEffort[]>([]);
  const [taskJobs, setTaskJobs] = useState<TBlpTaskJob[]>([]);
  const { addWorklogs, removeWorklogs } = useBlueprintTasks();

  const handleUpdate: FormProps["onFinish"] = async ({
    taskId,
    workingTimes,
    clearOld,
  }) => {
    if (!project || !category) {
      notification.error({ message: "you need to configure Blueprint first!" });
      return;
    }

    await updateWorklogs({
      taskId,
      workingTimes,
      clearOld,
      efforts: actualEfforts,
      addWorklogs,
      removeWorklogs,
      setState,
    });
  };

  useEffect(() => {
    setState(null);
    setEfforts([]);
    setTaskJobs([]);
    form.resetFields();
  }, [props.open]);

  const handleUpdateEfforts = async (task: TTaskDetail | null) => {
    if (!task) {
      setEfforts([]);
      setTaskJobs([]);
      return;
    }
    setEfforts(task.worklogs);
    // get task jobs
    const res = await getTaskJobs(
      task.reqId,
      (project as TProjectTransformed).id
    );
    if (res.error || !res.data) {
      notification.error({ message: res.error || "error when get task jobs" });
      setTaskJobs([]);
      return;
    }
    setTaskJobs(res.data);
  };

  return (
    <Modal title="Add worklogs for task" footer={null} width={680} {...props}>
      <Alert
        message="this feature is in maintenance mode"
        showIcon
        type="warning"
        className="!mb-3"
      />
      <Form
        form={form}
        onFinish={handleUpdate}
        layout="vertical"
        initialValues={{ clearOld: false }}
        disabled
      >
        <div className="grid grid-cols-2 gap-5 mb-5">
          <div>
            <Form.Item
              name="taskId"
              label="Task ID"
              rules={[{ required: true, message: "" }]}
              className="!mb-3"
            >
              <InputTaskId onGetTask={handleUpdateEfforts} />
            </Form.Item>
            <Form.Item
              name="clearOld"
              valuePropName="checked"
              className="!mb-0"
            >
              <Checkbox disabled={actualEfforts.length === 0}>
                Is need to clear old worklogs?
              </Checkbox>
            </Form.Item>
            <List
              dataSource={actualEfforts}
              size="small"
              bordered
              renderItem={(item) => (
                <List.Item>
                  {"You spent "}
                  <span className="font-bold">
                    {minsToJiraTime(Number(item.actEfrtMnt))}
                  </span>
                  {" on "}
                  <span className="font-bold">
                    {dayjs(item.wrkDt, "YYYYMMDD").format("DD/MM/YYYY")}
                  </span>
                </List.Item>
              )}
            />
          </div>
          <Form.Item label="Working Time" className="!mb-0">
            {taskJobs.length > 0 ? (
              taskJobs.map((job) => (
                <Form.List name={["workingTimes", job.jbId]} key={job.jbId}>
                  {(fields, { add, remove }) => {
                    if (fields.length === 0) {
                      return (
                        <div className="p-3 border rounded border-gray-100 mb-3 last:mb-0">
                          <div className="font-bold text-sm mb-1">
                            {job.jbNm}
                          </div>
                          <div className="p-3 rounded bg-gray-100">
                            <Button
                              htmlType="button"
                              onClick={() => add()}
                              block
                            >
                              add new worklog
                            </Button>
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div className="p-3 border rounded border-gray-100 mb-3 last:mb-0">
                        <div className="font-bold text-sm mb-1">{job.jbNm}</div>
                        {fields.map((field) => (
                          <FormItemWorkingTime
                            fieldKey={field.name}
                            add={add}
                            remove={remove}
                            key={field.key}
                          />
                        ))}
                      </div>
                    );
                  }}
                </Form.List>
              ))
            ) : (
              <span className="text-gray-400">no jobs for task</span>
            )}
          </Form.Item>
        </div>
        <div className="flex items-center justify-between">
          <Button type="primary" htmlType="submit">
            Update
          </Button>
        </div>
      </Form>
      {content}
    </Modal>
  );
};

export default AddWorklogModal;
