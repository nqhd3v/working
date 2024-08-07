"use server";

import { checkCookieBlp } from "@/utils/utils.server";
import { Blueprint } from "@nqhd3v/crazy";
import {
  TBlpTaskDetails,
  TBlpTaskEffort,
  TCreateTaskParams,
  TDeleteWorklogPayload,
  TFileUploadInfo,
  TInitTaskInfo,
  TWorklogPayload,
  TWorklogTime,
} from "@nqhd3v/crazy/types/blueprint";

const getBlp = async () => {
  const checkBlpCookie = await checkCookieBlp({ isCheckUser: true });
  if (!checkBlpCookie || !checkBlpCookie.user) {
    throw new Error("error when check authenticated info");
  }

  const { blp } = checkBlpCookie;
  return blp as Blueprint;
};

export async function uploadFile(formData: FormData): Promise<{
  data?: {
    bizFolder: string;
    lstFlNm: string[];
  } | null;
  error?: string;
}> {
  try {
    const checkBlpCookie = await checkCookieBlp({ isCheckUser: true });
    if (!checkBlpCookie || !checkBlpCookie.user) {
      return { error: "error when check authenticated info" };
    }

    const { username, password, cookies = [] } = checkBlpCookie;
    const blp = new Blueprint(username, password);
    const result = await blp.uploadFile(formData, cookies);

    return { data: result };
  } catch (e: any) {
    return { error: "error when upload file:" + e.message };
  }
}

export async function createTask(
  {
    project,
    category,
    jobType,
    process,
    iterationId,
    phasesWithAssigner,
  }: Omit<TCreateTaskParams, "phaseCode">,
  { title, description, descriptionHTML }: TInitTaskInfo
) {
  try {
    const blp = await getBlp();
    const result = await blp.createNewTask(
      {
        project,
        category,
        jobType,
        process,
        iterationId,
        phasesWithAssigner,
        phaseCode: "PIM_PHS_CDREG",
      },
      {
        title,
        description,
        descriptionHTML,
      }
    );

    return { data: result };
  } catch (e: any) {
    return { error: "error when create a new task: " + e.message };
  }
}

export async function getTaskById(taskId: string): Promise<{
  data?: (TBlpTaskDetails & { worklogs: TBlpTaskEffort[] }) | null;
  error?: string;
}> {
  try {
    const checkBlpCookie = await checkCookieBlp({ isCheckUser: true });
    if (!checkBlpCookie || !checkBlpCookie.user) {
      return { error: "error when check authenticated info" };
    }

    const { username, password, cookies = [] } = checkBlpCookie;
    const blp = new Blueprint(username, password);
    const result = await blp.getTaskById(taskId, cookies);

    return { data: result };
  } catch (e: any) {
    return { error: "error when upload file:" + e.message };
  }
}

export async function getTasksByJob(
  pageURL: string,
  {
    projectId,
    jobCode,
    states,
  }: {
    projectId: string;
    jobCode: string;
    states: string[];
  }
): Promise<{ data?: any; error?: string }> {
  try {
    const checkBlpCookie = await checkCookieBlp({ isCheckUser: true });
    if (!checkBlpCookie || !checkBlpCookie.user) {
      return { error: "error when check authenticated info" };
    }

    const { username, password, cookies = [] } = checkBlpCookie;
    const blp = new Blueprint(username, password);
    const result = await blp.getTasks(
      pageURL,
      {
        isOnlyMe: true,
        jobType: jobCode,
        projectId,
        state: states,
        size: 50,
      },
      cookies
    );

    return { data: result };
  } catch (e: any) {
    return { error: "error when upload file:" + e.message };
  }
}

export async function addFilesToTask(
  taskId: string,
  files: TFileUploadInfo[],
  folder: string
) {
  try {
    const checkBlpCookie = await checkCookieBlp({ isCheckUser: true });
    if (!checkBlpCookie || !checkBlpCookie.user) {
      return { error: "error when check authenticated info" };
    }

    const { username, password, cookies = [] } = checkBlpCookie;
    const blp = new Blueprint(username, password);
    const result = await blp.addFilesToTask(taskId, { files, folder }, cookies);

    return { data: result };
  } catch (e: any) {
    return { error: "error when upload file:" + e.message };
  }
}

export async function getTaskJobs(taskId: string, projectId: string) {
  try {
    const blp = await getBlp();
    console.log(blp.cookies);
    const result = await blp.getTaskJobs(taskId, projectId);

    return { data: result };
  } catch (e: any) {
    return { error: "error when when get task job: " + e.message };
  }
}

export async function addWorklog(
  taskId: string,
  timePayload: TWorklogTime,
  projectPayload: TWorklogPayload
) {
  try {
    const blp = await getBlp();
    const result = await blp.addWorklog(taskId, timePayload, projectPayload);
    // console.log("--", taskId, timePayload, projectPayload);
    return { data: result };
  } catch (e: any) {
    return { error: "error when add work-log: " + e.message };
  }
}

export async function removeWorklog(
  taskId: string,
  effort: TBlpTaskEffort,
  projectPayload: TDeleteWorklogPayload
) {
  try {
    const blp = await getBlp();
    // console.log("--", taskId, effort, projectPayload);
    const result = await blp.removeWorklog(taskId, effort, projectPayload);
    return { data: result };
  } catch (e: any) {
    return { error: "error when add work-log: " + e.message };
  }
}
