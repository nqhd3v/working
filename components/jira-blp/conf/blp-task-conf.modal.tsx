import SelectIteration from "@/components/blp/input/iteration.select";
import SelectJobTypes from "@/components/blp/input/job-type.select";
import { PhaseAssign } from "@/components/blp/input/phase-assign.card";
import SelectProcess from "@/components/blp/input/process.select";
import { useBlpStore } from "@/stores/blueprint";
import { getBlpProcessPhasesByProcess } from "@/utils/blp.request";
import { LoadingOutlined } from "@ant-design/icons";
import {
  Button,
  Empty,
  Form,
  FormInstance,
  FormProps,
  Modal,
  ModalProps,
  Select,
} from "antd";
import React, { useEffect } from "react";
import { JIRA_ISSUE_TO_BLP_TASK_TITLE } from "../utils";

const ModalBlpTaskConf: React.FC<Omit<ModalProps, "title" | "children">> = (
  props
) => {
  const [form] = Form.useForm();

  return (
    <Modal
      title="Configure for BLP Task"
      width="calc(100% - 40px)"
      style={{ maxWidth: 1000 }}
      footer={null}
      {...props}
    >
      <SetDefaultData onReset={() => form.setFieldValue("phases", null)} />
      <SetDefaultConfTask form={form} />
    </Modal>
  );
};

const SetDefaultData: React.FC<{ onReset?: () => void }> = ({ onReset }) => {
  const selectedIteration = useBlpStore.useSelectedIteration();
  const selectedJobType = useBlpStore.useSelectedJobType();
  const selectedProcess = useBlpStore.useSelectedProcess();
  const setIteration = useBlpStore.useUpdateSelectedIteration();
  const setJobType = useBlpStore.useUpdateSelectedJobType();
  const setProcess = useBlpStore.useUpdateSelectedProcess();
  const setPhases = useBlpStore.useUpdatePhases();

  const handleSaveRequiredConf: FormProps["onFinish"] = async ({
    jobType,
    iteration,
    process,
  }) => {
    setJobType(jobType);
    setIteration(iteration);
    setProcess(process);
  };

  const handleReset = () => {
    setJobType(null);
    setIteration(null);
    setProcess(null);
    setPhases(null);
    onReset?.();
  };

  if (selectedIteration && selectedJobType && selectedProcess) {
    return (
      <div className="mb-5">
        <div className="text-gray-400">
          {"You already set "}
          <span className="text-gray-500">
            <span className="font-bold">{selectedJobType.cdNm} (type)</span>
          </span>
          {", "}
          <span className="text-gray-500">
            <span className="font-bold">
              {selectedIteration.itrtnNm} (iteration)
            </span>
          </span>
          {" and "}
          <span className="text-gray-500">
            <span className="font-bold">
              {selectedProcess.bizProcNm} (process)
            </span>
          </span>
          {" as default."}
        </div>
        <span
          className="underline text-gray-500 cursor-pointer text-xs"
          onClick={() => {
            handleReset();
          }}
        >
          change your mind?
        </span>
      </div>
    );
  }
  return (
    <Form
      layout="vertical"
      initialValues={{
        jobType: selectedJobType,
        iteration: selectedIteration,
        process: selectedProcess,
      }}
      onFinish={handleSaveRequiredConf}
      className="mb-5"
    >
      <div className="grid grid-cols-3 gap-5">
        <Form.Item
          name="jobType"
          label="Job type"
          rules={[{ required: true, message: "pick job type" }]}
        >
          <SelectJobTypes />
        </Form.Item>
        <Form.Item
          name="iteration"
          label="Iteration"
          rules={[{ required: true, message: "pick iteration" }]}
        >
          <SelectIteration />
        </Form.Item>
        <Form.Item
          name="process"
          label="Process"
          rules={[{ required: true, message: "pick process" }]}
        >
          <SelectProcess />
        </Form.Item>
      </div>
      <Button htmlType="submit">Continue</Button>
    </Form>
  );
};

const SetDefaultConfTask: React.FC<{ form: FormInstance }> = ({ form }) => {
  const loading = useBlpStore.useLoading().phases;
  const project = useBlpStore.useSelectedProject();
  const setPhases = useBlpStore.useUpdatePhases();
  const category = useBlpStore.useSelectedCategory();
  const selectedIteration = useBlpStore.useSelectedIteration();
  const selectedProcess = useBlpStore.useSelectedProcess();

  const phases = useBlpStore.usePhases();

  const handleGetPhases = async () => {
    if (!selectedProcess || !project || !category || !selectedIteration) return;

    await getBlpProcessPhasesByProcess({
      projectId: project.id,
      subProjectId: category.prntPjtId,
      processId: selectedProcess.bizProcId,
      iterationId: selectedIteration.itrtnId,
      onData: (p) => {
        setPhases(p);
        form.setFieldValue("phases", p);
      },
    });
  };

  useEffect(() => {
    handleGetPhases();
  }, [
    project?.id,
    category?.pjtId,
    selectedIteration?.itrtnId,
    selectedProcess?.bizProcId,
  ]);

  console.log(phases);
  if (loading) {
    return (
      <div className="p-5 rounded-md bg-gray-100 py-10">
        <LoadingOutlined spin />
      </div>
    );
  }

  if (!phases) return null;

  if (phases.length === 0) {
    return (
      <div className="p-5 rounded-md bg-gray-100 py-10">
        <Empty description="no phases found" />
      </div>
    );
  }

  return (
    <div className="p-5 rounded-md bg-gray-100">
      <Form initialValues={{ phases }} form={form} layout="vertical">
        <div className="flex gap-5">
          <div className="w-[280px]">
            <Form.List name="phases">
              {(fields) => (
                <div>
                  {fields.map((field) => (
                    <Form.Item
                      {...field}
                      key={field.key}
                      className="!mb-3 !last:mb-0"
                    >
                      <PhaseAssign />
                    </Form.Item>
                  ))}
                </div>
              )}
            </Form.List>
          </div>
          <div className="w-[calc(100%-300px)]">
            <Form.Item name="title" label="Tittle">
              <Select
                mode="tags"
                options={JIRA_ISSUE_TO_BLP_TASK_TITLE}
                onChange={console.log}
              />
            </Form.Item>
          </div>
        </div>
      </Form>
    </div>
  );
};

export default ModalBlpTaskConf;
