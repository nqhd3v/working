import { JIRA_CONF_BOARD_ID, JIRA_CONF_ISSUE_TYPE_IDS } from "@/utils/constant";
import { $client } from "@/utils/request";
import {
  TBoardJira,
  TJiraIssueType,
  TUserJira,
} from "@nqhd3v/crazy/types/jira";
import React, {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";

export interface IJiraContext {
  user: TUserJira | null;
  currentStep: number;
  loadingStep: boolean;
  initializing: boolean;
  board: TBoardJira["id"] | null;
  issueTypes: TJiraIssueType["id"][];
  setUser: Dispatch<SetStateAction<TUserJira | null>>;
  setCurrentStep: Dispatch<SetStateAction<number>>;
  setLoadingStep: Dispatch<SetStateAction<boolean>>;
  setInitializing: Dispatch<SetStateAction<boolean>>;
  setBoard: Dispatch<SetStateAction<TBoardJira["id"] | null>>;
  setIssueTypes: Dispatch<SetStateAction<TJiraIssueType["id"][]>>;
}

const JiraContext = React.createContext<IJiraContext>({
  user: null,
  currentStep: 0,
  loadingStep: false,
  initializing: true,
  board: null,
  issueTypes: [],
  setUser() {},
  setLoadingStep() {},
  setInitializing() {},
  setCurrentStep() {},
  setBoard() {},
  setIssueTypes() {},
});

export const JiraProvider = ({
  children,
}: Readonly<{ children: React.ReactElement }>) => {
  const [user, setUser] = useState<TUserJira | null>(null);
  const [loadingStep, setLoadingStep] = useState<boolean>(false);
  const [initializing, setInitializing] = useState<boolean>(true);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [board, setBoard] = useState<TBoardJira["id"] | null>(null);
  const [issueTypes, setIssueTypes] = useState<TJiraIssueType["id"][]>([]);

  useEffect(() => {
    const defaultBoard = localStorage.getItem(JIRA_CONF_BOARD_ID);
    const defaultIssueTypes = localStorage.getItem(JIRA_CONF_ISSUE_TYPE_IDS);

    if (defaultBoard) {
      setBoard(Number(defaultBoard));
      setIssueTypes(defaultIssueTypes ? defaultIssueTypes.split(",") : []);
    }
  }, []);

  return (
    <JiraContext.Provider
      value={{
        user,
        loadingStep,
        initializing,
        currentStep,
        board,
        issueTypes,
        setUser,
        setLoadingStep,
        setInitializing,
        setCurrentStep,
        setBoard,
        setIssueTypes,
      }}
    >
      {children}
    </JiraContext.Provider>
  );
};

export const useJira = () => useContext(JiraContext);
export const useJiraDefaultData = () => {
  const { user, board, issueTypes, setBoard, setIssueTypes, setCurrentStep } =
    useJira();
  const [issueTypeData, setIssueTypeData] = useState<TJiraIssueType[]>([]);
  const [boardData, setBoardData] = useState<TBoardJira[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGetBoards = async (init?: boolean) => {
    init && setLoading(true);
    try {
      const res = await $client<{ boards: TBoardJira[] }>("jira/boards");

      if (!Array.isArray(res.data.boards)) {
        return;
      }
      setBoardData(res.data.boards);

      // filter local by data from jira
      if (!board) {
        return;
      }
      if (!res.data.boards.find((b) => b.id === board)) {
        setBoard(null);
        setIssueTypes([]);
        localStorage.removeItem(JIRA_CONF_BOARD_ID);
        localStorage.removeItem(JIRA_CONF_ISSUE_TYPE_IDS);
        return;
      }
      await handleGetIssueTypeByBoard(board);
    } catch (e) {
      console.error(e);
    } finally {
      init && setLoading(false);
    }
  };

  const handleGetIssueTypeByBoard = async (
    boardId: string | number,
    init?: boolean
  ) => {
    init && setLoading(true);
    try {
      const res = await $client<{ issueTypes: TJiraIssueType[] }>(
        "jira/issue-types",
        { params: { boardId } }
      );

      if (
        Array.isArray(res.data.issueTypes) &&
        res.data.issueTypes.length > 0
      ) {
        setIssueTypeData(res.data.issueTypes);
      }

      // filter local by data from Jira
      if (issueTypes.length === 0) return;
      const issueTypesFromJira = res.data.issueTypes.map((i) => i.id);
      const issueTypesAvailable = issueTypes.filter((i) =>
        issueTypesFromJira.includes(i)
      );

      if (issueTypesAvailable.length === 0) {
        setIssueTypes([]);
        localStorage.removeItem(JIRA_CONF_ISSUE_TYPE_IDS);
        return;
      }

      setIssueTypes(issueTypesAvailable);
      setCurrentStep((s) => (s += 1));
      localStorage.setItem(
        JIRA_CONF_ISSUE_TYPE_IDS,
        issueTypesAvailable.join(",")
      );
    } catch (e) {
      console.error(e);
    } finally {
      init && setLoading(false);
    }
  };

  useEffect(() => {
    if (user) handleGetBoards(true);
  }, [user]);

  return {
    loading,
    boardData,
    issueTypeData,
    getIssueTypes: handleGetIssueTypeByBoard,
  };
};
