import { checkCookieBlp } from "@/utils/utils.server";
import { Blueprint } from "@nqhd3v/crazy";
import { NextRequest } from "next/server";

export const GET = async (
  request: NextRequest,
  { params }: { params: { projectId: string } }
) => {
  const searchParams = request.nextUrl.searchParams;
  const pageURL = searchParams.get("pageURL") as string;
  try {
    const checkBlpCookie = await checkCookieBlp({ isCheckUser: true });
    if (
      !pageURL ||
      !params.projectId ||
      !checkBlpCookie ||
      !checkBlpCookie.user
    )
      return Response.json({ categories: null });

    const { username, password, cookies = [] } = checkBlpCookie;
    const blp = new Blueprint(username, password);

    const categories = await blp.getCategoryByProject(
      pageURL,
      params.projectId,
      cookies
    );
    if (!categories) return Response.json({ categories: null });

    return Response.json({ categories });
  } catch (e) {
    console.error("-- error when get projects", e);
    return Response.json({ categories: null });
  }
};
