import { BLP_TOKEN_KEY } from "@/utils/constant";
import { encrypt } from "@/utils/encrypt.server";
import { checkCookieBlp } from "@/utils/utils.server";
import { Blueprint } from "@nqhd3v/crazy";
import { NextRequest } from "next/server";

export const GET = async () => {
  const checkBlpCookie = await checkCookieBlp({ isCheckUser: true });
  if (!checkBlpCookie || !checkBlpCookie.user) {
    return Response.json(
      {},
      {
        headers: {
          "Set-Cookie": `${BLP_TOKEN_KEY}=`,
        },
      }
    );
  }
  const { user, username, password, cookies } = checkBlpCookie;
  if (!cookies) {
    return Response.json({ user });
  }
  const encrypted = encrypt(
    [username, password, JSON.stringify(cookies)].join("::=::")
  );
  return Response.json(
    { user: checkBlpCookie.user },
    {
      headers: {
        "Set-Cookie": `${BLP_TOKEN_KEY}=${encrypted}`,
      },
    }
  );
};

export const POST = async (req: NextRequest) => {
  const { username, password } = await req.json();
  const blp = new Blueprint(username, password);
  await blp.login();
  if (blp.user) {
    const encrypted = encrypt(
      [username, password, JSON.stringify(blp.cookies)].join("::=::")
    );

    return Response.json(
      {
        user: blp.user,
      },
      {
        headers: {
          "Set-Cookie": `${BLP_TOKEN_KEY}=${encrypted}`,
        },
      }
    );
  }
  return Response.json({ user: null });
};
