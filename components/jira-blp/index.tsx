"use client";
import { useJiraStore } from "@/stores/jira";
import { mapJiraSprintToOptions } from "@/utils/mapping-data";
import { TSprintJira } from "@nqhd3v/crazy/types/jira";
import { Button, Card, Select } from "antd";
import { find } from "lodash";
import JiraIssuesTable from "./jira.issue";
import BlpJiraConf from "./conf";
import { useState } from "react";
import ModalBiWeeklyReport from "./conf/bi-weekly-rp.modal";

const JiraBlpTitle: React.FC<{ onOpenBiWeeklyModal?: () => void }> = ({
  onOpenBiWeeklyModal,
}) => {
  const board = useJiraStore.useSelectedBoard();
  const sprintData = useJiraStore.useSprints();
  const selectedSprint = useJiraStore.useSelectedSprint();
  const setSprint = useJiraStore.useUpdateSelectedSprint();
  const { sprints: loadingSprints } = useJiraStore.useLoading();

  const handlePickSprint = (selectedId: number) => {
    if (!sprintData) return;
    const selected = find(sprintData, (s) => s.id === selectedId);
    setSprint(selected as TSprintJira);
  };

  return (
    <div className="flex items-center justify-between">
      <div>Create BLP with JIRA</div>
      <div className="flex gap-3 items-center">
        <Button onClick={() => onOpenBiWeeklyModal?.()}>
          Bi-Weekly Report
        </Button>
        <Select
          disabled={!board}
          className={"w-[160px]"}
          dropdownStyle={{ width: 240 }}
          value={selectedSprint?.id}
          options={mapJiraSprintToOptions(sprintData || [])}
          loading={loadingSprints}
          onChange={handlePickSprint}
        />
        <BlpJiraConf />
      </div>
    </div>
  );
};

const JiraToBlp = () => {
  const [isOpenModalBiWeekly, setOpenModalBiWeekly] = useState(false);
  return (
    <>
      <Card
        title={
          <JiraBlpTitle
            onOpenBiWeeklyModal={() => setOpenModalBiWeekly(true)}
          />
        }
      >
        <JiraIssuesTable />
      </Card>
      <ModalBiWeeklyReport
        open={isOpenModalBiWeekly}
        onCancel={() => setOpenModalBiWeekly(false)}
      />
    </>
  );
};

export default JiraToBlp;
