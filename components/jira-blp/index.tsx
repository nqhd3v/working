"use client";
import { useJiraStore } from "@/stores/jira";
import { mapJiraSprintToOptions } from "@/utils/mapping-data";
import { TSprintJira } from "@nqhd3v/crazy/types/jira";
import { Button, Card, Divider, GetRef, Select, Tooltip } from "antd";
import { find } from "lodash";
import JiraIssuesTable from "./jira.issue";
import BlpJiraConf from "./conf";
import ModalBiWeeklyReport from "./components/bi-weekly-modal";
import { useSetState } from "ahooks";
import ManualDropdown from "./manual";
import { ReloadOutlined } from "@ant-design/icons";
import { useBlpStore } from "@/stores/blueprint";
import { useBlueprintTasks } from "@/hooks/use-blp-tasks";
import { useTourGuideRefs } from "../tour-guide";
import { RefObject } from "react";
import ConfCreateTaskModal from "./conf/conf-phase-assigner";

const JiraBlpTitle: React.FC<{
  onOpenBiWeeklyModal?: () => void;
}> = ({ onOpenBiWeeklyModal }) => {
  const { biWeekly, selectSprint, checkBlpTask } = useTourGuideRefs();
  const board = useJiraStore.useSelectedBoard();
  const isLoadingBlpTasks = useBlpStore.useLoading().tasks;
  const sprintData = useJiraStore.useSprints();
  const selectedSprint = useJiraStore.useSelectedSprint();
  const setSprint = useJiraStore.useUpdateSelectedSprint();
  const { sprints: loadingSprints, issues: loadingIssues } =
    useJiraStore.useLoading();

  const { getTasks } = useBlueprintTasks();

  const handlePickSprint = (selectedId: number) => {
    if (!sprintData) return;
    const selected = find(sprintData, (s) => s.id === selectedId);
    setSprint(selected as TSprintJira);
  };

  return (
    <div className="flex items-center justify-between">
      <div>Create BLP with JIRA</div>
      <div className="flex gap-3 items-center">
        <ManualDropdown />
        <Button
          disabled={!selectSprint}
          onClick={() => onOpenBiWeeklyModal?.()}
          ref={biWeekly}
        >
          Bi-Weekly Report
        </Button>
        <Divider type="vertical" />
        <div ref={selectSprint}>
          <Select
            disabled={!board || loadingSprints || loadingIssues}
            className={"w-[160px]"}
            dropdownStyle={{ width: 240 }}
            value={selectedSprint?.id}
            options={mapJiraSprintToOptions(sprintData || [])}
            loading={loadingSprints}
            onChange={handlePickSprint}
          />
        </div>
        <Divider type="vertical" />
        <Tooltip title="Load tasks from Blueprint" placement="left">
          <Button
            icon={<ReloadOutlined spin={isLoadingBlpTasks} />}
            disabled={isLoadingBlpTasks}
            onClick={() => getTasks()}
            ref={checkBlpTask}
          />
        </Tooltip>
        <BlpJiraConf />
      </div>
    </div>
  );
};

const JiraToBlp = () => {
  const [{ isOpenModalBiWeekly }, setStates] = useSetState<{
    isOpenModalBiWeekly: boolean;
  }>({
    isOpenModalBiWeekly: false,
  });
  return (
    <>
      <Card
        title={
          <JiraBlpTitle
            onOpenBiWeeklyModal={() => setStates({ isOpenModalBiWeekly: true })}
          />
        }
      >
        <JiraIssuesTable />
      </Card>
      <ModalBiWeeklyReport
        open={isOpenModalBiWeekly}
        onCancel={() => setStates({ isOpenModalBiWeekly: false })}
      />
      <ConfCreateTaskModal />
    </>
  );
};

export default JiraToBlp;
