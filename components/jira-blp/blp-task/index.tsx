import { TJiraIssue } from "@nqhd3v/crazy/types/jira";
import { Collapse } from "antd";
import { useJiraStore } from "@/stores/jira";
import { useBlpStore } from "@/stores/blueprint";
import { getTaskLink } from "@/utils/blp.request";
import { useInTourGuide, useTourGuideRefs } from "@/components/tour-guide";
import { renderIssues } from "./utils";

const BlpNewTasks: React.FC<{ items: TJiraIssue[] }> = ({ items }) => {
  const colors = useJiraStore.useIssueTypeColors();
  const pageURL = useBlpStore.usePageURL();
  const tasks = useBlpStore.useTasks() || [];
  const isInTourGuide = useInTourGuide();
  const { issues: loadingIssues } = useJiraStore.useLoading();
  const { jiraIssueTable } = useTourGuideRefs();

  return (
    <Collapse
      ref={jiraIssueTable}
      items={renderIssues({
        items,
        tasks,
        colors,
        loading: loadingIssues,
        isInTour: isInTourGuide,
        getTaskLink: (id) => getTaskLink(pageURL || "", id),
      })}
    />
  );
};

export default BlpNewTasks;
