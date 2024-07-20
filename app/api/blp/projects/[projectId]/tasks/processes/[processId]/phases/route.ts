import { checkCookieBlp } from "@/utils/utils.server";
import { Blueprint } from "@nqhd3v/crazy";
import { NextRequest } from "next/server";

export const GET = async (
  request: NextRequest,
  { params }: { params: { projectId: string; processId: string } }
) => {
  const searchParams = request.nextUrl.searchParams;
  const iterationId = searchParams.get("iterationId") as string;
  const subProjectId = searchParams.get("subProjectId") as string;
  const checkBlpCookie = await checkCookieBlp({ isCheckUser: true });
  if (
    !params.projectId ||
    !params.processId ||
    !iterationId ||
    !checkBlpCookie ||
    !checkBlpCookie.user
  )
    return Response.json({ phases: null });

  const { username, password, cookies = [] } = checkBlpCookie;
  const blp = new Blueprint(username, password);

  const res = await blp.getProcessPhasesByProcess(
    {
      projectId: params.projectId,
      subProjectId,
      iterationId,
      processId: params.processId,
    },
    cookies
  );
  if (!res)
    return Response.json({
      phases: null,
    });

  return Response.json({ phases: res.phases });
};
