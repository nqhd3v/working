import { useJiraStore } from "@/stores/jira";
import {
  getJiraBoards,
  getJiraIssues,
  getJiraIssueTypeByBoard,
  getJiraSprints,
  getJiraUser,
} from "@/utils/jira.request";
import {
  TBoardJira,
  TJiraIssue,
  TJiraIssueType,
} from "@nqhd3v/crazy/types/jira";
import { useSetState } from "ahooks";
import { SetState } from "ahooks/lib/useSetState";
import React, { useContext, useEffect } from "react";

export type TJiraStates = {
  // data
  boards: TBoardJira[];
  issues: TJiraIssue[];
  issueTypes: TJiraIssueType[];
  // loading
  initializing: boolean;
  loadingUser: boolean;
  loadingBoard: boolean;
  loadingIssue: boolean;
  loadingIssueType: boolean;
  // other
  currentStep: number;
};

export interface IJiraContext {
  states: TJiraStates;
  setStates: SetState<TJiraStates>;
  getBoards: () => Promise<void>;
  getIssueTypes: (boardId: string | number, init?: boolean) => Promise<void>;
  getSprints: (boardId: string | number) => Promise<void>;
  getIssues: (boardId: string | number, issueTypes: string[]) => Promise<void>;
  getUser: (email: string, pat: string) => Promise<void>;
  reset: () => void;
}

const defaultStates: TJiraStates = {
  issues: [],
  boards: [],
  issueTypes: [],
  currentStep: 0,
  loadingUser: false,
  initializing: true,
  loadingBoard: false,
  loadingIssueType: false,
  loadingIssue: false,
};

const JiraContext = React.createContext<IJiraContext>({
  states: defaultStates,
  setStates() {},
  getBoards: () => Promise.resolve(void 0),
  getIssueTypes: () => Promise.resolve(void 0),
  getIssues: () => Promise.resolve(void 0),
  getUser: () => Promise.resolve(void 0),
  getSprints: () => Promise.resolve(void 0),
  reset: () => {},
});

export const JiraProvider = ({
  children,
}: Readonly<{ children: React.ReactElement }>) => {
  const user = useJiraStore.useUser();
  const selectedBoard = useJiraStore.useSelectedBoard();
  const selectedIssueTypes = useJiraStore.useSelectedIssueTypes();
  const setUser = useJiraStore.useUpdateUser();
  const setBoard = useJiraStore.useUpdateSelectedBoard();
  const setIssueTypes = useJiraStore.useUpdateSelectedIssueTypes();
  const setSprints = useJiraStore.useUpdateSprints();
  const setLoadingSprints = useJiraStore.useUpdateLoadingSprints();
  const [states, setStates] = useSetState<TJiraStates>(defaultStates);

  const __resetLocal = () => {
    setBoard(null);
    setIssueTypes(null);
  };

  const handleGetBoards = async (init?: boolean) => {
    await getJiraBoards({
      onLoading: (s) => setStates({ loadingBoard: s }),
      callback: async (boards) => {
        setStates({ boards });

        // filter local by data from jira
        if (!selectedBoard) return;
        if (!boards.find((b) => b.id === selectedBoard.id)) {
          return __resetLocal();
        }
        await handleGetIssueTypeByBoard(selectedBoard.id, init);
        await handleGetSprints(selectedBoard.id);
      },
    });
  };

  const handleGetIssueTypeByBoard = async (
    boardId: string | number,
    init?: boolean
  ) => {
    await getJiraIssueTypeByBoard({
      boardId,
      onLoading: (s) => setStates({ loadingIssueType: s }),
      callback: async (issueTypes) => {
        setStates({ issueTypes });

        // filter local by data from Jira
        if (!init || !selectedIssueTypes || selectedIssueTypes.length === 0)
          return;
        const issueTypesFromJira = issueTypes.map((i) => i.id);
        const issueTypesAvailable = selectedIssueTypes.filter((i) =>
          issueTypesFromJira.includes(i.id)
        );

        setIssueTypes(
          issueTypesAvailable.length === 0 ? null : issueTypesAvailable
        );
      },
    });
  };

  const handleGetIssues = async (
    boardId: string | number,
    issueTypes: string[]
  ) => {
    await getJiraIssues({
      boardId,
      issueTypes,
      onLoading: (s) => setStates({ loadingIssue: s }),
      callback: async (issues) => {
        setStates({ issues });
      },
    });
  };

  const handleGetSprints = async (boardId: string | number) => {
    await getJiraSprints({
      boardId,
      onLoading: setLoadingSprints,
      callback: setSprints,
    });
  };

  const handleGetUser = async (email: string, pat: string) => {
    await getJiraUser({
      email,
      pat,
      onLoading: (s) => setStates({ loadingUser: s }),
      callback: setUser,
    });
  };

  useEffect(() => {
    if (user?.accountId) handleGetBoards(true);
  }, [user?.accountId]);

  return (
    <JiraContext.Provider
      value={{
        states,
        setStates,
        getBoards: handleGetBoards,
        getIssueTypes: handleGetIssueTypeByBoard,
        getIssues: handleGetIssues,
        getUser: handleGetUser,
        getSprints: handleGetSprints,
        reset: __resetLocal,
      }}
    >
      {children}
    </JiraContext.Provider>
  );
};

export const useJira = () => useContext(JiraContext);
