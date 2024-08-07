import SelectIteration from "@/components/blp/input/iteration.select";
import SelectJobTypes from "@/components/blp/input/job-type.select";
import SelectProcess from "@/components/blp/input/process.select";
import { useBlueprintTasks } from "@/hooks/use-blp-tasks";
import { useBlpStore } from "@/stores/blueprint";
import { Button, Empty, Form, FormProps, Skeleton } from "antd";

const SetDefaultData: React.FC<{ onReset?: () => void }> = ({ onReset }) => {
  const {
    process: selectedProcess,
    iteration: selectedIteration,
    jobType: selectedJobType,
  } = useBlpStore.useConfForInitTask() || {};
  const iterations = useBlpStore.useIterations();
  const jobTypes = useBlpStore.useJobTypes();
  const { taskRequireData: loading } = useBlpStore.useLoading();
  const { getTasks } = useBlueprintTasks();

  const setPhases = useBlpStore.useUpdatePhases();
  const setConfForInitTask = useBlpStore.useUpdateConfForInitTask();

  const handleSaveRequiredConf: FormProps["onFinish"] = async ({
    jobType,
    iteration,
    process,
  }) => {
    setConfForInitTask({
      process,
      jobType,
      iteration,
    });

    await getTasks();
  };

  const handleReset = () => {
    setConfForInitTask(null);
    setPhases(null, true);
    onReset?.();
  };

  if (loading) {
    return <Skeleton active />;
  }

  if (!jobTypes || !iterations) {
    return (
      <div className="w-full py-10 flex justify-center">
        <Empty description="no data found! check authenticate first!" />
      </div>
    );
  }

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
      className="mb-5 hide-errors"
    >
      <div className="grid grid-cols-3 gap-5">
        <Form.Item name="jobType" label="Job type" rules={[{ required: true }]}>
          <SelectJobTypes />
        </Form.Item>
        <Form.Item
          name="iteration"
          label="Iteration"
          rules={[{ required: true }]}
        >
          <SelectIteration allowClear />
        </Form.Item>
        <Form.Item shouldUpdate={(f, s) => f.iteration !== s.iteration} noStyle>
          {({ getFieldValue }) => {
            const itr = getFieldValue("iteration");

            return (
              <Form.Item
                name="process"
                label="Process"
                rules={[{ required: true }]}
              >
                <SelectProcess iterationId={itr?.itrtnId} />
              </Form.Item>
            );
          }}
        </Form.Item>
      </div>
      <Button htmlType="submit">Continue</Button>
    </Form>
  );
};

export default SetDefaultData;
