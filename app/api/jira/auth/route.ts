import { JIRA_TOKEN_KEY } from "@/utils/constant";
import { encrypt } from "@/utils/encrypt.server";
import { checkCookieJira } from "@/utils/utils.server";
import { Jira } from "@nqhd3v/crazy";
import { NextRequest } from "next/server";

export const GET = async () => {
  const checkJiraCookie = await checkCookieJira({ isCheckUser: true });
  if (checkJiraCookie && checkJiraCookie.user) {
    return Response.json({ user: checkJiraCookie.user });
  }

  return Response.json(
    {},
    {
      headers: {
        "Set-Cookie": `${JIRA_TOKEN_KEY}=`,
      },
    }
  );
};

export const POST = async (req: NextRequest) => {
  const { email, pat } = await req.json();
  const jira = new Jira({ email, token: pat });
  const user = await jira.getUserInfo();
  if (user) {
    const encrypted = encrypt([email, pat].join("::=::"));

    return Response.json(
      {
        user,
      },
      {
        headers: {
          "Set-Cookie": `${JIRA_TOKEN_KEY}=${encrypted}`,
        },
      }
    );
  }
  return Response.json({ user: null });
};
