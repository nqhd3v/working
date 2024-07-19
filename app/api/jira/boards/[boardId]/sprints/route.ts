import { checkCookieJira } from "@/utils/utils.server";
import { Jira } from "@nqhd3v/crazy";
import { NextRequest } from "next/server";

export const GET = async (
  req: NextRequest,
  { params: { boardId } }: { params: { boardId: string } }
) => {
  const checkJiraResult = await checkCookieJira({ isCheckUser: true });
  if (!boardId || !checkJiraResult || !checkJiraResult.user) {
    return Response.json({ error: "no authenticate info found!" });
  }
  try {
    const { email, token } = checkJiraResult;
    const jira = new Jira({ email, token });

    const sprints = await jira.getSprintsByBoard(Number(boardId));

    return Response.json({ sprints });
  } catch (e: any) {
    console.error("-- error when get sprints by board", e);
    return Response.json({ sprints: null, error: e.message });
  }
};
