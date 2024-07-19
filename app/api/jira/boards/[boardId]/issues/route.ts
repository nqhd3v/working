import { JIRA_TOKEN_KEY } from "@/utils/constant";
import { checkCookieJira } from "@/utils/utils.server";
import { Jira } from "@nqhd3v/crazy";
import { NextRequest } from "next/server";

export const GET = async (
  request: NextRequest,
  { params: { boardId } }: { params: { boardId: string } }
) => {
  const searchParams = request.nextUrl.searchParams;
  const issueTypes = searchParams.get("issueTypes") as unknown as string;

  const checkResult = await checkCookieJira();
  if (!boardId || !checkResult || !checkResult.user) {
    return Response.json(
      {
        error: "user with authenticated info is not found",
      },
      {
        headers: {
          "Set-Cookie": `${JIRA_TOKEN_KEY}=`,
        },
      }
    );
  }

  const { email, token } = checkResult;
  const jira = new Jira({ email, token });
  const issues = await jira.getMyIssuesActiveSprintByBoard(
    Number(boardId),
    issueTypes.split(",")
  );

  return Response.json({
    issues,
  });
};
