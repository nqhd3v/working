import SelectMappingWorkHours from "@/components/blp/input/mapping-work-hour.select";
import TaskConfTittle, {
  EJiraIssueField,
} from "@/components/blp/input/task-conf-title.select";
import InputWorkHour from "@/components/blp/input/work-hour.input";
import { useBlpStore } from "@/stores/blueprint";
import { TMappingWorkHourCase } from "@/types/blp";
import { TBlpTaskJob } from "@nqhd3v/crazy/types/blueprint";
import { Button, Form, FormProps, notification } from "antd";
import TaskJobSelector from "../../components/task-job-select";

const RegConfForm = () => {
  const [form] = Form.useForm();
  const registerConf = useBlpStore.useConfForRegTask();
  const setRegConf = useBlpStore.useUpdateConfForRegTask();

  const handleSaveConf: FormProps<{
    title: string[];
    workHours: number;
    mappingCase: TMappingWorkHourCase;
    jobType: TBlpTaskJob;
  }>["onFinish"] = ({ title, workHours, mappingCase, jobType }) => {
    setRegConf({
      title,
      jiraWorkHours: workHours,
      mappingJiraWorkHoursCase: mappingCase,
      jobType,
    });
    notification.success({
      message: "Save configuration for register a new task successfully!",
    });
  };

  return (
    <>
      <div className="text-gray-400 mb-3">
        This configure will be use as default for your task! In case use create
        Bi-Weekly, I will implement that feature in another section!
      </div>
      <Form
        initialValues={{
          title: registerConf?.title || [
            EJiraIssueField.KEY,
            " - ",
            EJiraIssueField.SUMMARY,
          ],
          workHours: registerConf?.jiraWorkHours || 6.5,
          mappingCase:
            registerConf?.mappingJiraWorkHoursCase ||
            "smaller:origin;greater:add",
          jobType: registerConf?.jobType,
        }}
        form={form}
        layout="vertical"
        className="hide-errors"
        onFinish={handleSaveConf}
      >
        <div className="flex flex-col justify-between">
          <div>
            <Form.Item name="title" label="Tittle" rules={[{ required: true }]}>
              <TaskConfTittle />
            </Form.Item>
            <Form.Item
              name="workHours"
              label="Working-Hours"
              rules={[{ required: true }]}
            >
              <InputWorkHour />
            </Form.Item>
            <Form.Item shouldUpdate noStyle>
              {({ getFieldValue }) => {
                const wkHrs = getFieldValue("workHours");
                return (
                  <Form.Item
                    name="mappingCase"
                    label="Your working time on Blueprint will be..."
                    rules={[{ required: true }]}
                  >
                    <SelectMappingWorkHours jiraWorkHour={wkHrs} />
                  </Form.Item>
                );
              }}
            </Form.Item>
            <Form.Item
              name="jobType"
              label="Job type for task"
              rules={[{ required: true, message: "pick job type" }]}
            >
              <TaskJobSelector />
            </Form.Item>
          </div>
          <div className="flex items-center justify-end mt-5">
            <Button htmlType="submit" type="primary">
              Save
            </Button>
          </div>
        </div>
      </Form>
    </>
  );
};

export default RegConfForm;
