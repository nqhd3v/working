import { checkCookieJira } from "@/utils/utils.server";
import { Jira } from "@nqhd3v/crazy";
import { NextRequest } from "next/server";

export const GET = async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const boardId = searchParams.get("boardId") as unknown as number;

  const checkResult = await checkCookieJira();
  if (!boardId || !checkResult || !checkResult.user) return Response.json({});

  const { email, token } = checkResult;
  const jira = new Jira({ email, token });
  const issueTypes = await jira.getIssueTypesByBoard(boardId);

  return Response.json({ issueTypes });
};
