"use client";
import ProgressIcon from "@/components/progress-icon";
import { SettingOutlined, UserOutlined } from "@ant-design/icons";
import { Card, Steps } from "antd";
import { useEffect } from "react";
import BlpProvider, { useBlueprint } from "./context";
import BlpAuth from "./auth";
import BlpDefaultData from "./default-info";
import { useBlpStore } from "@/stores/blueprint";
import {
  getBlpProcessPhasesByProcess,
  getBlpRequireDataForCreateTask,
} from "@/utils/blp.request";
import { TPhaseTransformed } from "@/types/blp";
import { useBlueprintTasks } from "@/hooks/use-blp-tasks";
import { useTourGuideRefs } from "../tour-guide";

const InternalBlpSetupCard = () => {
  const {
    states: { currentStep, initializing },
  } = useBlueprint();
  const { blpAuth } = useTourGuideRefs();
  const user = useBlpStore.useUser();
  const project = useBlpStore.useSelectedProject();
  const category = useBlpStore.useSelectedCategory();
  const setJobTypes = useBlpStore.useUpdateJobTypes();
  const setLoading = useBlpStore.useUpdateLoading();
  const setIterations = useBlpStore.useUpdateIterations();
  const setPhases = useBlpStore.useUpdatePhases();
  const initConfTask = useBlpStore.useConfForInitTask();
  const regTaskConf = useBlpStore.useConfForRegTask();

  const handleGetDefaultData = async () => {
    if (!user || !project || !category) return;

    await getBlpRequireDataForCreateTask({
      projectId: project.id,
      subProjectId: category.prntPjtId,
      onData: async ({ jobTypes, iterations }) => {
        setJobTypes(jobTypes);
        setIterations(iterations);
      },
    });
  };

  const handleGetPhases = async () => {
    if (!project || !category || !initConfTask) return;

    await getBlpProcessPhasesByProcess<TPhaseTransformed>({
      projectId: project.id,
      subProjectId: category.prntPjtId,
      processId: initConfTask.process.bizProcId,
      iterationId: initConfTask.iteration.itrtnId,
      onData: (p) => {
        const phaseValues: TPhaseTransformed[] = p.map((pi, index) => ({
          ...pi,
          selected: regTaskConf?.assignerByPhase[index]?.assigner.usrId,
        }));
        setPhases(phaseValues, true);
      },
      onLoading: setLoading("phases"),
    });
  };

  useEffect(() => {
    handleGetPhases();
  }, [!initConfTask]);

  useEffect(() => {
    handleGetDefaultData();
  }, [user?.usrId, project?.id, category?.pjtId]);

  return (
    <Card title="Blueprint Setup" ref={blpAuth}>
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
