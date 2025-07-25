import { UserModel, LinkModel, PageModel, UserFeedModel } from 'common/models';
import { REST_DOMAIN } from 'client/constants/network';
import debug from 'debug';
const log = debug('webapp:api-service');
const error = debug('webapp:error');

export async function getCurrentUser(url: string): Promise<UserModel | undefined> {
  try {
    log("Getting current User");
    const userResponse = await fetch(url, { credentials: "include" });
    const userData: UserModel = await userResponse.json();
    log(userData);

    return userData;
  } catch (err) {
    error("Problem Getting current User: " + err.toString());
    return undefined;
  }
}

export async function getLinks(url: string): Promise<LinkModel[] | undefined> {
  try {
    log("Getting User's Links");
    const linkResponse = await fetch(url, { credentials: "include" });
    const linksData: LinkModel[] = await linkResponse.json();
    log(linksData);

    return linksData;
  } catch (err) {
    error("Problem Getting Links: " + err.toString());
    return undefined;
  }
}

/** Gets all the page data for the user, but only populates UserFeeds on the initial page */
export async function getUsersPagesWithFirstPopulated(pagesURL: string, pageURL: string): Promise<PageModel[] | undefined> {
  try {
    log("Getting User's Pages");
    const pagesResponse = await fetch(pagesURL, { credentials: "include" });
    const pagesData: PageModel[] = await pagesResponse.json();
    log(pagesData);
    let initialPage = pagesData[0];
    if (!initialPage.pageID) throw new Error("First Page's ID is undefined");

    log("Getting initial page UserFeeds for User");
    const userFeedsResponse = await fetch(pageURL + initialPage.pageID.toString(), { credentials: "include" });
    const userFeedsData: UserFeedModel[] = await userFeedsResponse.json();
    log(userFeedsData);

    // Assemble Initial Page
    initialPage.userFeeds = userFeedsData;

    // return initialPage;
    return pagesData;
  } catch (err) {
    error("Problem Getting First Page: " + err.toString());
    return undefined;
  }
}