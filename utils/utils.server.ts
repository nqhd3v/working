import { cookies } from "next/headers";
import { BLP_TOKEN_KEY, JIRA_TOKEN_KEY } from "./constant";
import { decrypt } from "./encrypt.server";
import { Blueprint, Jira } from "@nqhd3v/crazy";
import { TUserJira } from "@nqhd3v/crazy/types/jira";
import { TUserInfo } from "@nqhd3v/crazy/types/blueprint";

export const checkCookieJira = async ({
  isCheckUser = true,
}: {
  isCheckUser?: boolean;
} = {}): Promise<
  { email: string; token: string; user: TUserJira | null } | null | undefined
> => {
  const cookie = cookies();
  const jiraToken = cookie.get(JIRA_TOKEN_KEY);
  if (!jiraToken || !jiraToken.value) return undefined;

  const decryptedData = decrypt(jiraToken.value);
  if (!decryptedData) return null;

  const [email, token] = decryptedData.split("::=::");

  if (!isCheckUser) {
    return { email, token, user: null };
  }
  const jira = new Jira({ email, token });
  const user = await jira.getUserInfo();

  return { email, token, user };
};

export const checkCookieBlp = async ({
  isCheckUser = true,
}: {
  isCheckUser?: boolean;
} = {}): Promise<
  | {
      username: string;
      password: string;
      user: TUserInfo | null;
      cookies?: string[];
    }
  | null
  | undefined
> => {
  const cookie = cookies();
  const blpToken = cookie.get(BLP_TOKEN_KEY);
  if (!blpToken || !blpToken.value) return undefined;

  const decryptedData = decrypt(blpToken.value);
  if (!decryptedData) return null;

  const [username, password, authCookiesStr] = decryptedData.split("::=::");

  if (!isCheckUser) {
    return { username, password, user: null };
  }
  // try to use old cookie
  const oldCookies = jsonParse<string[]>(authCookiesStr);

  const blp = new Blueprint(username, password);
  const userWithOldCki = oldCookies
    ? await blp.getUserByCookies(oldCookies)
    : null;

  if (userWithOldCki) {
    return { username, password, user: userWithOldCki, cookies: oldCookies };
  }
  await blp.login();

  return { username, password, user: blp.user, cookies: blp.cookies };
};

export const jsonParse = <T>(inp: string): T | undefined => {
  try {
    return JSON.parse(inp);
  } catch (e) {
    return undefined;
  }
};
