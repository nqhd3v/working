import SelectMappingWorkHours from "@/components/blp/input/mapping-work-hour.select";
import { PhaseAssign } from "@/components/blp/input/phase-assign.card";
import TaskConfTittle, {
  EJiraIssueField,
} from "@/components/blp/input/task-conf-title.select";
import InputWorkHour from "@/components/blp/input/work-hour.input";
import { useBlpStore } from "@/stores/blueprint";
import { TMappingWorkHourCase, TPhaseTransformed } from "@/types/blp";
import { TBlpTaskJob, TBlpUserRole } from "@nqhd3v/crazy/types/blueprint";
import { Button, Empty, Form, FormProps, notification, Skeleton } from "antd";
import { isEqual } from "lodash";
import { useEffect } from "react";
import TaskJobSelector from "../../components/task-job-select";

const SetDefaultConfTask = () => {
  const loading = useBlpStore.useLoading().phases;
  const phasesForConf = useBlpStore.usePhasesForConf();

  if (loading) {
    return (
      <div className="p-5 rounded-md bg-gray-100">
        <Skeleton active />
      </div>
    );
  }

  if (!phasesForConf) return null;

  if (phasesForConf.length === 0) {
    return (
      <div className="p-5 rounded-md bg-gray-100 py-10">
        <Empty description="no phases found" />
      </div>
    );
  }

  return <RegConfForm />;
};

const RegConfForm = () => {
  const [form] = Form.useForm();
  const phasesForConf = useBlpStore.usePhasesForConf() as TPhaseTransformed[];
  const registerConf = useBlpStore.useConfForRegTask();
  const setRegConf = useBlpStore.useUpdateConfForRegTask();

  const handleSaveConf: FormProps<{
    phases: TPhaseTransformed[];
    title: string[];
    workHours: number;
    mappingCase: TMappingWorkHourCase;
    jobType: TBlpTaskJob;
  }>["onFinish"] = ({ phases, title, workHours, mappingCase, jobType }) => {
    const assignerByPhase = phases.map((phase) => ({
      code: phase.code,
      assigner: phase.assigners.find(
        (a) => a.usrId === phase.selected
      ) as TBlpUserRole,
    }));
    setRegConf({
      assignerByPhase,
      title,
      jiraWorkHours: workHours,
      mappingJiraWorkHoursCase: mappingCase,
      jobType,
    });
    notification.success({
      message: "Save configuration for register a new task successfully!",
    });
  };

  useEffect(() => {
    const currentPhasesValue = form.getFieldValue("phases");
    if (!isEqual(phasesForConf, currentPhasesValue)) {
      form.setFieldValue("phases", phasesForConf);
    }
  }, [!phasesForConf]);

  return (
    <div className="p-5 rounded-md bg-gray-100">
      <div className="text-gray-400 mb-3">
        This configure will be use as default for your task! In case use create
        Bi-Weekly, I will implement that feature in another section!
      </div>
      <Form
        initialValues={{
          phases: phasesForConf.map((phase, index) => ({
            ...phase,
            selected: registerConf?.assignerByPhase[index].assigner.usrId,
          })),
          title: registerConf?.title || [
            EJiraIssueField.KEY,
            " - ",
            EJiraIssueField.SUMMARY,
          ],
          workHours: registerConf?.jiraWorkHours || 6.5,
          mappingCase:
            registerConf?.mappingJiraWorkHoursCase ||
            "smaller:origin;greater:add",
        }}
        form={form}
        layout="vertical"
        className="hide-errors"
        onFinish={handleSaveConf}
      >
        <div className="flex gap-5">
          <div className="w-[280px]">
            <Form.List name="phases">
              {(fields) => (
                <div>
                  {fields.map((field) => (
                    <Form.Item
                      {...field}
                      key={field.key}
                      className="!mb-3 last:!mb-0"
                      rules={[
                        () => ({
                          validator: (_, value) => {
                            if (!value || !value.selected)
                              return Promise.reject("");
                            return Promise.resolve();
                          },
                        }),
                      ]}
                    >
                      <PhaseAssign />
                    </Form.Item>
                  ))}
                </div>
              )}
            </Form.List>
          </div>
          <div className="w-[calc(100%-300px)] flex flex-col justify-between">
            <div>
              <Form.Item
                name="title"
                label="Tittle"
                rules={[{ required: true }]}
              >
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
            <div>
              <Button htmlType="submit">Save</Button>
            </div>
          </div>
        </div>
      </Form>
    </div>
  );
};

export default SetDefaultConfTask;
