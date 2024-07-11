import { checkCookieJira } from "@/utils/utils.server";
import { Jira } from "@nqhd3v/crazy";

export const GET = async () => {
  const checkResult = await checkCookieJira();
  if (!checkResult || !checkResult.user) return Response.json({});

  const { email, token } = checkResult;
  const jira = new Jira({ email, token });
  const boards = await jira.getBoards();

  return Response.json({
    boards,
  });
};
