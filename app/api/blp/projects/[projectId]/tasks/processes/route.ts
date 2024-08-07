import { checkCookieBlp } from "@/utils/utils.server";
import { Blueprint } from "@nqhd3v/crazy";
import { NextRequest } from "next/server";

export const GET = async (
  request: NextRequest,
  { params }: { params: { projectId: string } }
) => {
  const searchParams = request.nextUrl.searchParams;
  const iterationId = searchParams.get("iterationId") as string;
  const checkBlpCookie = await checkCookieBlp({ isCheckUser: true });
  if (
    !params.projectId ||
    !iterationId ||
    !checkBlpCookie ||
    !checkBlpCookie.user
  ) {
    console.log(
      params.projectId && iterationId
        ? "invalid auth info"
        : "invalid project/iteration"
    );
    return Response.json({ processes: null });
  }

  const { username, password, cookies = [] } = checkBlpCookie;
  const blp = new Blueprint(username, password);

  const processes = await blp.getProcessesByIteration(
    { projectId: params.projectId, iterationId },
    cookies
  );
  if (!processes)
    return Response.json({
      processes: null,
    });

  return Response.json({ processes });
};
