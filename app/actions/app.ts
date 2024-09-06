"use server";
import { BLP_TOKEN_KEY, JIRA_TOKEN_KEY } from "@/utils/constant";
import { decrypt, encrypt } from "@/utils/encrypt.server";
import { cookies } from "next/headers";

export const exportToken = () => {
  const cookie = cookies();
  const jira = cookie.get(JIRA_TOKEN_KEY);
  const blp = cookie.get(BLP_TOKEN_KEY);

  const jiraToken = jira?.value;
  const blpToken = blp?.value;

  return {
    encrypted: encrypt(JSON.stringify({ jira: jiraToken, blp: blpToken })),
  };
};

// export const getToken = (encryptedStr: string) => {};
