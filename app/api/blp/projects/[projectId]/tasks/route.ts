import { checkCookieBlp } from "@/utils/utils.server";
import { Blueprint } from "@nqhd3v/crazy";
import { NextRequest } from "next/server";

export const GET = async (
  request: NextRequest,
  { params }: { params: { projectId: string } }
) => {
  const searchParams = request.nextUrl.searchParams;
  const pageURL = searchParams.get("pageURL") as string;
  const statesStr = searchParams.get("states") as string;
  try {
    const checkBlpCookie = await checkCookieBlp({ isCheckUser: true });
    if (
      !pageURL ||
      !params.projectId ||
      !checkBlpCookie ||
      !checkBlpCookie.user
    )
      return Response.json({ tasks: null });

    const { username, password, cookies = [] } = checkBlpCookie;
    const blp = new Blueprint(username, password);

    const tasks = await blp.getTasks(
      pageURL,
      {
        projectId: params.projectId,
        state: statesStr.split(","),
        isOnlyMe: true,
      },
      cookies
    );
    if (!tasks) return Response.json({ tasks: null });

    return Response.json({ tasks });
  } catch (e) {
    console.error("-- error when get projects", e);
    return Response.json({ tasks: null });
  }
};
