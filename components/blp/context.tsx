import {
  BLP_CONF_PRJ_ID,
  BLP_CONF_ROOT_PRJ_ID,
  BLP_REQUIREMENT_STATE_START_WITH,
} from "@/utils/constant";
import { $client } from "@/utils/request";
import { useSetState } from "ahooks";
import {
  TBlpTask,
  TComCdTransformed,
  TGroupedCategory,
  TProjectTransformed,
  TUserInfo,
} from "@nqhd3v/crazy/types/blueprint";
import { createContext, useContext, useEffect, useRef } from "react";
import { SetState } from "ahooks/lib/useSetState";

export interface IBlpContext {
  states: TBlueprintSetupStates;
  setStates: SetState<TBlueprintSetupStates>;
  getProjects: (init?: boolean) => Promise<void>;
  getCategories: (projectId: string, init?: boolean) => Promise<void>;
  getTasks: (
    projectId: string,
    states?: string[],
    size?: number
  ) => Promise<void>;
  getTaskLink: (taskId: string) => string;
  resetLocal: () => void;
}

const defaultStates: TBlueprintSetupStates = {
  selectedCategory: null,
  selectedProject: null,
  currentStep: 0,
  loadingStep: false,
  loadingCategory: false,
  loadingProject: false,
  loadingTask: false,
  initializing: true,
  user: null,
  requestStates: [],
  categories: [],
  projects: [],
  tasks: [],
};

const BlpContext = createContext<IBlpContext>({
  states: defaultStates,
  setStates() {},
  getProjects: () => Promise.resolve(void 0),
  getCategories: () => Promise.resolve(void 0),
  getTasks: () => Promise.resolve(void 0),
  getTaskLink: () => "",
  resetLocal() {},
});

export type TBlueprintSetupStates = {
  currentStep: number;
  selectedCategory: string | null;
  selectedProject: string | null;
  // data
  user: TUserInfo | null;
  projects: TProjectTransformed[];
  categories: TGroupedCategory;
  tasks: TBlpTask[];
  requestStates: TComCdTransformed[];
  // loading
  loadingStep: boolean;
  initializing: boolean;
  loadingProject: boolean;
  loadingCategory: boolean;
  loadingTask: boolean;
};

const BlpProvider = ({
  children,
}: Readonly<{ children: React.ReactElement }>) => {
  const [states, setStates] = useSetState<TBlueprintSetupStates>(defaultStates);
  const { selectedProject, requestStates, user } = states;
  const pageURL = useRef("");

  const resetLocal = () => {
    setStates({
      selectedCategory: null,
      selectedProject: null,
    });
    localStorage.removeItem(BLP_CONF_ROOT_PRJ_ID);
    localStorage.removeItem(BLP_CONF_PRJ_ID);
  };

  // func
  const handleGetProjects = async (init?: boolean): Promise<void> => {
    try {
      setStates({
        loadingProject: true,
      });
      const res = await $client<{
        pageURL: string;
        projects: TProjectTransformed[];
        comCds: TComCdTransformed[];
      }>("blp/projects");

      if (!Array.isArray(res.data.projects) || res.data.projects.length === 0) {
        return;
      }

      pageURL.current = res.data.pageURL;
      setStates({
        projects: res.data.projects,
        requestStates: (res.data.comCds || []).filter((cd) =>
          cd.key.startsWith(BLP_REQUIREMENT_STATE_START_WITH)
        ),
      });
      if (init && selectedProject) {
        const isExistPrj = res.data.projects.find(
          (p) => p.id === selectedProject
        );
        if (!isExistPrj) {
          resetLocal();
        } else {
          await handleGetCategories(selectedProject, init);
        }
      }
    } catch (e) {
      console.error("error when get blueprint projects", e);
    } finally {
      setStates({
        loadingProject: false,
      });
    }
  };

  const handleGetCategories = async (
    projectId: string,
    init?: boolean
  ): Promise<void> => {
    try {
      setStates({
        loadingCategory: true,
      });
      const res = await $client<{ categories: TGroupedCategory }>(
        `blp/projects/${projectId}/categories`,
        {
          params: {
            pageURL: pageURL.current,
          },
        }
      );

      if (!Array.isArray(res.data.categories)) {
        return;
      }

      setStates({
        categories: res.data.categories,
      });
    } catch (e) {
    } finally {
      setStates({
        loadingCategory: false,
      });
    }
  };

  const handleGetTasks = async (
    projectId: string,
    reqStates?: string[],
    size = 10
  ) => {
    const states = reqStates || requestStates.map((s) => s.key);
    try {
      setStates({ loadingTask: true });
      const res = await $client<{ tasks: TBlpTask[] }>(
        `blp/projects/${projectId}/tasks`,
        {
          params: {
            pageURL: pageURL.current,
            states: states.join(","),
            size,
          },
        }
      );

      if (!Array.isArray(res.data.tasks)) return;

      setStates({ tasks: res.data.tasks });
    } catch (e) {
    } finally {
      setStates({ loadingTask: false });
    }
  };

  const getTaskLink = (taskId: string) =>
    `https://blueprint.cyberlogitec.com.vn/${pageURL.current}_1/${taskId}`;

  const initData = () => {
    const rootPrj = localStorage.getItem(BLP_CONF_ROOT_PRJ_ID);
    const subPrj = localStorage.getItem(BLP_CONF_PRJ_ID);

    if (!rootPrj || !subPrj) {
      localStorage.removeItem(BLP_CONF_ROOT_PRJ_ID);
      localStorage.removeItem(BLP_CONF_PRJ_ID);
      return;
    }

    setStates({
      selectedProject: rootPrj,
      selectedCategory: subPrj,
    });
  };

  // use effects
  useEffect(() => initData(), []);
  useEffect(() => {
    if (user) handleGetProjects(true);
  }, [user?.usrId]);

  return (
    <BlpContext.Provider
      value={{
        states,
        setStates,
        getProjects: handleGetProjects,
        getCategories: handleGetCategories,
        getTasks: handleGetTasks,
        getTaskLink,
        resetLocal,
      }}
    >
      {children}
    </BlpContext.Provider>
  );
};

export default BlpProvider;
export const useBlueprint = () => useContext(BlpContext);
