import { checkCookieBlp } from "@/utils/utils.server";
import { Blueprint } from "@nqhd3v/crazy";

export const GET = async () => {
  try {
    const checkBlpCookie = await checkCookieBlp({ isCheckUser: true });
    if (!checkBlpCookie || !checkBlpCookie.user)
      return Response.json({ projects: null });

    const { username, password, cookies = [] } = checkBlpCookie;
    const blp = new Blueprint(username, password);

    const projectsRes = await blp.getMyProjects(cookies);
    if (!projectsRes) return Response.json({ projects: null });

    return Response.json(projectsRes);
  } catch (e) {
    console.error("-- error when get projects", e);
    return Response.json({ projects: null });
  }
};
