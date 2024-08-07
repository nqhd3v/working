import { JIRA_TOKEN_KEY } from "@/utils/constant";
import { encrypt } from "@/utils/encrypt.server";
import { checkCookieJira } from "@/utils/utils.server";
import { Jira } from "@nqhd3v/crazy";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export const GET = async () => {
  const checkJiraCookie = await checkCookieJira({ isCheckUser: true });
  if (checkJiraCookie && checkJiraCookie.user) {
    return Response.json({ user: checkJiraCookie.user });
  }

  cookies().delete(JIRA_TOKEN_KEY);
  return Response.json({});
};

export const POST = async (req: NextRequest) => {
  const { email, pat } = await req.json();
  const jira = new Jira({ email, token: pat });
  const user = await jira.getUserInfo();
  if (user) {
    const encrypted = encrypt([email, pat].join("::=::"));

    cookies().set({
      name: JIRA_TOKEN_KEY,
      value: encrypted,
      httpOnly: true,
      secure: true,
      path: "/",
    });
    return Response.json({
      user,
    });
  }
  return Response.json({ user: null });
};
