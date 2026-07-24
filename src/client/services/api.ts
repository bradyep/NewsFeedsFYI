import { UserModel, LinkModel, PageModel, UserFeedModel } from 'common/models';
import debug from 'debug';
const log = debug('webapp:api-service');
const error = debug('webapp:error');

export async function getCurrentUser(url: string): Promise<UserModel | undefined> {
  try {
    log("Getting current User");
    const userResponse = await fetch(url, { credentials: "include" });
    const userData: UserModel = await userResponse.json();
    log("Returned User's Data: ", userData);

    return userData;
  } catch (err) {
    error("Problem Getting current User: " + err);
    return undefined;
  }
}

export async function getLinks(url: string): Promise<LinkModel[] | undefined> {
  try {
    log("Getting User's Links");
    const linkResponse = await fetch(url, { credentials: "include" });
    const linksData: LinkModel[] = await linkResponse.json();
    log("Returned User's Links: ", linksData);

    return linksData;
  } catch (err) {
    error("Problem Getting Links: " + err);
    return undefined;
  }
}

/** Gets all the page data for the user, but only populates UserFeeds on the initial page */
export async function getUsersPagesWithFirstPopulated(pagesURL: string, pageURL: string): Promise<PageModel[] | undefined> {
  try {
    log("Getting User's Pages");
    const pagesResponse = await fetch(pagesURL, { credentials: "include" });
    const pagesData: PageModel[] = await pagesResponse.json();
    log("Returned User's Pages: ", pagesData);
    let initialPage = pagesData[0];
    if (!initialPage.pageID) throw new Error("First Page's ID is undefined");

    // Get UserFeeds for the initial page
    const userFeedsResponse: UserFeedModel[] = await getUserPageFeeds(pageURL, initialPage.pageID);

    // Assemble Initial Page
    initialPage.userFeeds = userFeedsResponse;

    return pagesData;
  } catch (err) {
    error("Problem Getting First Page: " + err);
    return undefined;
  }
}

export async function getUserPageFeeds(pageURL: string, pageId: number): Promise<UserFeedModel[]> {
  try {
    log("Getting page UserFeeds for User");
    const userFeedsResponse = await fetch(pageURL + pageId.toString(), { credentials: "include" });
    const userFeedsData: UserFeedModel[] = await userFeedsResponse.json();
    log("Returned User Feeds: ", userFeedsData);

    return userFeedsData;
  } catch (err) {
    error(`Problem Getting UserFeeds for PageId : ${pageId} | ` + err);
    return [];
  }
}

let cachedCsrfToken: string | undefined;

/** Fetches (and caches) the CSRF token needed on all mutating requests. Call once at app boot
 *  and again if a mutating request ever comes back 403 with an invalid-token error. */
export async function fetchCsrfToken(url: string): Promise<string | undefined> {
  try {
    const response = await fetch(url, { credentials: "include" });
    const data = await response.json();
    cachedCsrfToken = data.csrfToken;
    return cachedCsrfToken;
  } catch (err) {
    error("Problem fetching CSRF token: " + err);
    return undefined;
  }
}

function csrfHeaders(extra: Record<string, string> = {}): Headers {
  const headers = new Headers(extra);
  if (cachedCsrfToken) headers.append("X-CSRF-Token", cachedCsrfToken);
  return headers;
}

export interface AuthResult {
  ok: boolean;
  status: number;
  user?: { userID: number; username: string; roleID: number };
  message?: string;
}

export async function login(url: string, username: string, password: string): Promise<AuthResult> {
  const headers = csrfHeaders({ "Content-Type": "application/json" });
  const response = await fetch(url, {
    credentials: "include",
    method: "POST",
    headers,
    body: JSON.stringify({ username, password })
  });
  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, user: response.ok ? data : undefined, message: data.message };
}

export async function register(url: string, username: string, password: string, email: string): Promise<AuthResult> {
  const headers = csrfHeaders({ "Content-Type": "application/json" });
  const response = await fetch(url, {
    credentials: "include",
    method: "POST",
    headers,
    body: JSON.stringify({ username, password, email })
  });
  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, user: response.ok ? data : undefined, message: data.message };
}

export async function logout(url: string): Promise<boolean> {
  try {
    const headers = csrfHeaders();
    const response = await fetch(url, { credentials: "include", method: "POST", headers });
    return response.ok;
  } catch (err) {
    error("Problem logging out: " + err);
    return false;
  }
}
