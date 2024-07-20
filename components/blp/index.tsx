"use client";
import ProgressIcon from "@/components/progress-icon";
import { $client } from "@/utils/request";
import { SettingOutlined, UserOutlined } from "@ant-design/icons";
import { Card, Steps } from "antd";
import { useEffect } from "react";
import BlpProvider, { useBlueprint } from "./context";
import BlpAuth from "./auth";
import BlpDefaultData from "./default-info";
import { useBlpStore } from "@/stores/blueprint";
import { TBlpIteration, TBlpJobType } from "@nqhd3v/crazy/types/blueprint";
import {
  getBlpProcessByIterations,
  getBlpRequireDataForCreateTask,
} from "@/utils/blp.request";

const InternalBlpSetupCard = () => {
  const {
    states: { currentStep, initializing },
  } = useBlueprint();
  const user = useBlpStore.useUser();
  const project = useBlpStore.useSelectedProject();
  const category = useBlpStore.useSelectedCategory();
  const setJobTypes = useBlpStore.useUpdateJobTypes();
  const setIterations = useBlpStore.useUpdateIterations();
  const setProcesses = useBlpStore.useUpdateProcesses();
  const setSelectedIteration = useBlpStore.useUpdateSelectedIteration();

  const handleGetDefaultData = async () => {
    if (!user || !project || !category) return;

    await getBlpRequireDataForCreateTask({
      projectId: project.id,
      subProjectId: category.prntPjtId,
      onData: async ({ jobTypes, iterations }) => {
        setJobTypes(jobTypes);
        setIterations(iterations);

        if (iterations.length === 1) {
          setSelectedIteration(iterations[0]);
          await getBlpProcessByIterations({
            projectId: project.id,
            iterationId: iterations[0].itrtnId,
            onData: setProcesses,
          });
        }
      },
    });
  };

  useEffect(() => {
    handleGetDefaultData();
  }, [user?.usrId, project?.id, category?.pjtId]);

  return (
    <Card title="Blueprint Setup">
      <Steps
        current={currentStep}
        direction="vertical"
        items={[
          {
            title: "Configure Blueprint Authenticate info",
            description: <BlpAuth />,
            icon: (
              <ProgressIcon
                icon={<UserOutlined />}
                loading={initializing}
                index={0}
                current={currentStep}
              />
            ),
          },
          {
            title: "Set default data",
            description: <BlpDefaultData />,
            icon: (
              <ProgressIcon
                icon={<SettingOutlined />}
                loading={false}
                index={1}
                current={currentStep}
              />
            ),
          },
        ]}
      />
    </Card>
  );
};

export default function BlpSetupCard() {
  return (
    <BlpProvider>
      <InternalBlpSetupCard />
    </BlpProvider>
  );
}
