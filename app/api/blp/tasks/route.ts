import isValidatedNewTaskPayload from "@/services/validator/new-task";
import { checkCookieBlp } from "@/utils/utils.server";
import { Blueprint } from "@nqhd3v/crazy";
import { NextRequest } from "next/server";

export const POST = async (request: NextRequest) => {
  const body = await request.json();
  const isValidated = await isValidatedNewTaskPayload(body);
  if (!isValidated) {
    return Response.json({
      error: "invalid payload",
    });
  }
  try {
    const checkBlpCookie = await checkCookieBlp({ isCheckUser: true });
    if (!checkBlpCookie || !checkBlpCookie.user)
      return Response.json({ tasks: null });

    const { username, password, cookies = [] } = checkBlpCookie;
    const blp = new Blueprint(username, password);

    const payload = await blp.createNewTask(
      {
        project: body.project,
        category: body.category,
        jobType: body.jobType,
        process: body.process,
        iterationId: body.iterationId,
        phasesWithAssigner: body.phasesWithAssigner,
        phaseCode: "PIM_PHS_CDREG",
      },
      {
        title: body.title,
        description: body.description,
        descriptionHTML: body.descriptionHTML,
      },
      cookies
    );
    if (!payload) return Response.json({ payload: null });

    return Response.json({ payload });
  } catch (e) {
    console.error("-- error when send request to create new task", e);
    return Response.json({ payload: null });
  }
};
