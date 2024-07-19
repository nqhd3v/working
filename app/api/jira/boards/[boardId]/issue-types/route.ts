import { checkCookieJira } from "@/utils/utils.server";
import { Jira } from "@nqhd3v/crazy";
import { NextRequest } from "next/server";

export const GET = async (
  request: NextRequest,
  { params: { boardId } }: { params: { boardId: string } }
) => {
  const checkResult = await checkCookieJira();
  if (!boardId || !checkResult || !checkResult.user) return Response.json({});

  const { email, token } = checkResult;
  const jira = new Jira({ email, token });
  const issueTypes = await jira.getIssueTypesByBoard(Number(boardId));

  return Response.json({ issueTypes });
};
