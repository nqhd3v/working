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
import { useBlpStore } from "@/stores/blueprint";
import { flatMap } from "lodash";

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
}

const defaultStates: TBlueprintSetupStates = {
  currentStep: 0,
  loadingStep: false,
  loadingCategory: false,
  loadingProject: false,
  loadingTask: false,
  initializing: true,
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
});

export type TBlueprintSetupStates = {
  currentStep: number;
  // data
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
  const user = useBlpStore.useUser();
  const selectedProject = useBlpStore.useSelectedProject();
  const selectedCategory = useBlpStore.useSelectedCategory();
  const setUser = useBlpStore.useUpdateUser();
  const setProject = useBlpStore.useUpdateSelectedProject();
  const setCategory = useBlpStore.useUpdateSelectedCategory();

  const [states, setStates] = useSetState<TBlueprintSetupStates>(defaultStates);
  const { requestStates } = states;
  const pageURL = useRef("");

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
        requestStates: res.data.comCds,
      });
      if (init && selectedProject) {
        const isExistPrj = res.data.projects.find(
          (p) => p.id === selectedProject.id
        );
        if (!isExistPrj) {
          setProject(null);
        } else {
          await handleGetCategories(selectedProject.id, init);
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

      if (!init || !selectedCategory || res.data.categories.length === 0) {
        return;
      }

      const isExistPrj = flatMap(res.data.categories, (c) => c.subItems).find(
        (p) => p.pjtId === selectedCategory.pjtId
      );
      if (!isExistPrj) setCategory(null);
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

  const handleCheckUser = async () => {
    setStates({ initializing: true });
    try {
      const res = await $client("blp/auth");
      if (res.data.user) {
        setUser(res.data.user);
        setStates((prev) => ({
          ...prev,
          currentStep: prev.currentStep + 1,
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setStates({ initializing: false });
    }
  };

  // use effects
  useEffect(() => {
    handleCheckUser();
  }, []);
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
      }}
    >
      {children}
    </BlpContext.Provider>
  );
};

export default BlpProvider;
export const useBlueprint = () => useContext(BlpContext);
