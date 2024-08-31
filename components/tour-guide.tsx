import { Button, Card, GetRef, Tag, Tour } from "antd";
import { createContext, RefObject, useContext, useRef, useState } from "react";

const TourGuideContext = createContext<{
  isGuiding: boolean;
  actions: {
    start: () => void;
    finish: () => void;
  };
  refs: {
    jiraAuth: RefObject<GetRef<typeof Card>>;
    blpAuth: RefObject<GetRef<typeof Card>>;
    jiraIssueConf: RefObject<GetRef<typeof Button>>;
    jiraIssueTable: RefObject<HTMLDivElement>;
    manualActions: RefObject<GetRef<typeof Button>>;
    biWeekly: RefObject<GetRef<typeof Button>>;
    selectSprint: RefObject<HTMLDivElement>;
    checkBlpTask: RefObject<GetRef<typeof Button>>;
    issueHeader: RefObject<HTMLDivElement>;
  };
}>({
  isGuiding: false,
  actions: {
    start: () => void 0,
    finish: () => void 0,
  },
  refs: {
    jiraAuth: { current: null },
    blpAuth: { current: null },
    jiraIssueConf: { current: null },
    jiraIssueTable: { current: null },
    manualActions: { current: null },
    biWeekly: { current: null },
    selectSprint: { current: null },
    checkBlpTask: { current: null },
    issueHeader: { current: null },
  },
});

const TourGuide: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [opening, setOpening] = useState(false);

  // refs
  const jiraAuthGuideRef = useRef<GetRef<typeof Card>>(null);
  const blpAuthGuideRef = useRef<GetRef<typeof Card>>(null);
  const jiraIssueConfGuideRef = useRef<GetRef<typeof Button>>(null);
  const jiraIssueTableGuideRef = useRef<HTMLDivElement>(null);
  const manualActionsGuideRef = useRef<GetRef<typeof Button>>(null);
  const biWeeklyGuideRef = useRef<GetRef<typeof Button>>(null);
  const selectSprintGuideRef = useRef<HTMLDivElement>(null);
  const getBlpTaskGuideRef = useRef<GetRef<typeof Button>>(null);
  // refs - table item
  const issueHeaderRef = useRef<HTMLDivElement>(null);
  // refs - table item - details

  return (
    <>
      <TourGuideContext.Provider
        value={{
          isGuiding: opening,
          actions: {
            start: () => setOpening(true),
            finish: () => setOpening(false),
          },
          refs: {
            jiraAuth: jiraAuthGuideRef,
            blpAuth: blpAuthGuideRef,
            jiraIssueConf: jiraIssueConfGuideRef,
            jiraIssueTable: jiraIssueTableGuideRef,
            manualActions: manualActionsGuideRef,
            biWeekly: biWeeklyGuideRef,
            selectSprint: selectSprintGuideRef,
            checkBlpTask: getBlpTaskGuideRef,
            issueHeader: issueHeaderRef,
          },
        }}
      >
        {children}
      </TourGuideContext.Provider>

      <Tour
        open={opening}
        onClose={() => setOpening(false)}
        onFinish={() => {
          localStorage.setItem("cr@zy_experienced", Date.now().toString());
        }}
        steps={[
          {
            title: "Authenticate for Jira",
            description: "With your email & PAT, we can retrieve the issues",
            target: () => jiraAuthGuideRef.current!,
          },
          {
            title: "Authenticate for Blueprint",
            description:
              "With your username & password, we can retrieve your tasks, teams, working-times,...",
            target: () => blpAuthGuideRef.current!,
          },

          {
            title: "Manual actions",
            description:
              "Allow you can upload images or add worklogs for a task with the task ID",
            target: () => manualActionsGuideRef.current!,
          },
          {
            title: "Bi-Weekly",
            description:
              "A feature to create Bi-Weekly report & add working-times based on the meetings you have!",
            target: () => biWeeklyGuideRef.current!,
          },
          {
            title: "Show issues with what sprint?",
            description: "Select sprint you want to view, or do anythings...",
            target: () => selectSprintGuideRef.current!,
          },
          {
            title: "Fetch task from Blueprint",
            description:
              "This will call a request to Blueprint, with the Job type you have configured in the before step, and show the ID for the issues below.",
            target: () => getBlpTaskGuideRef.current!,
          },
          {
            title: "Configure for Blueprint's task",
            description:
              "This will allows you customize the task's title, working-times, job-type when you create new Blueprint task based on the data from Jira's issue data.",
            target: () => jiraIssueConfGuideRef.current!,
          },
          {
            title: "Jira issues view",
            description:
              "View your Jira issues, issue-type, and the BLP task (if created),...",
            target: () => jiraIssueTableGuideRef.current!,
          },
        ]}
      />
    </>
  );
};

export default TourGuide;
export const useTourGuideRefs = () => useContext(TourGuideContext).refs;
export const useTourGuideActions = () => useContext(TourGuideContext).actions;
export const useInTourGuide = () => useContext(TourGuideContext).isGuiding;
