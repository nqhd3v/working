import { checkCookieBlp } from "@/utils/utils.server";
import { Blueprint } from "@nqhd3v/crazy";
import { NextRequest } from "next/server";

export const GET = async (
  request: NextRequest,
  { params }: { params: { projectId: string } }
) => {
  const searchParams = request.nextUrl.searchParams;
  const subProjectId = searchParams.get("subProjectId") as string;
  const checkBlpCookie = await checkCookieBlp({ isCheckUser: true });
  if (
    !params.projectId ||
    !subProjectId ||
    !checkBlpCookie ||
    !checkBlpCookie.user
  )
    return Response.json({ iterations: null, jobTypes: null });

  const { username, password, cookies = [] } = checkBlpCookie;
  const blp = new Blueprint(username, password);

  const res = await blp.getRequireDataForCreateTask(
    { projectId: params.projectId, subProjectId },
    cookies
  );
  if (!res)
    return Response.json({
      iterations: null,
      jobTypes: null,
    });

  return Response.json(res);
};
