import { BLP_TOKEN_KEY } from "@/utils/constant";
import { encrypt } from "@/utils/encrypt.server";
import { checkCookieBlp } from "@/utils/utils.server";
import { Blueprint } from "@nqhd3v/crazy";
import dayjs from "dayjs";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export const GET = async () => {
  const checkBlpCookie = await checkCookieBlp({ isCheckUser: true });
  if (!checkBlpCookie || !checkBlpCookie.user) {
    cookies().delete(BLP_TOKEN_KEY);
    return Response.json({});
  }
  const { user, username, password, cookies: blpCookies } = checkBlpCookie;
  if (!blpCookies) {
    return Response.json({ user });
  }
  const encrypted = encrypt(
    [username, password, JSON.stringify(blpCookies)].join("::=::")
  );
  cookies().set({
    name: BLP_TOKEN_KEY,
    value: encrypted,
    httpOnly: true,
    secure: true,
    path: "/",
    expires: dayjs().add(1, "year").toDate(),
  });
  return Response.json({ user: checkBlpCookie.user });
};

export const POST = async (req: NextRequest) => {
  const { username, password } = await req.json();
  const blp = new Blueprint(username, password);
  await blp.login();
  if (blp.user) {
    const encrypted = encrypt(
      [username, password, JSON.stringify(blp.cookies)].join("::=::")
    );

    cookies().set({
      name: BLP_TOKEN_KEY,
      value: encrypted,
      httpOnly: true,
      secure: true,
      path: "/",
    });
    return Response.json({
      user: blp.user,
    });
  }
  return Response.json({ user: null });
};
