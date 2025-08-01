import { observable, computed, action, makeObservable } from 'mobx';
import { PageModel, UserFeedModel } from 'common/models';

export class PageStore {

  // Pages
  public pages: Array<PageModel>;
  public currentlyDisplayedPageID: number;

  constructor(fixtures: PageModel[]) {
    // Make properties observable using makeObservable for MobX v6+
    makeObservable(this, {
      pages: observable,
      currentlyDisplayedPageID: observable,
      currentlyDisplayedPage: computed,
      setCurrentlyDisplayedPage: action,
      setPages: action,
      addPage: action,
      editPage: action,
      deletePage: action,
      addUserFeed: action,
      editUserFeed: action,
      deleteUserFeed: action
    });

    this.pages = fixtures;
    // Set active page
    const sortedPages = this.pages.sort((a, b) => a.displayOrder - b.displayOrder);
    this.currentlyDisplayedPageID = sortedPages[0].pageID || -1;

    this.addPage = this.addPage.bind(this);
    this.editPage = this.editPage.bind(this);
    this.deletePage = this.deletePage.bind(this);
    this.addUserFeed = this.addUserFeed.bind(this);
    this.editUserFeed = this.editUserFeed.bind(this);
    this.deleteUserFeed = this.deleteUserFeed.bind(this);
  }

  get currentlyDisplayedPage(): PageModel {
    const activePage = this.pages.find(p => p.pageID === this.currentlyDisplayedPageID);
    if (!activePage) throw new Error("No Active Page Set");
    return activePage;
  }

  setCurrentlyDisplayedPage(id: number) {
    const page = this.pages.find(p => p.pageID === id);
    if (page) this.currentlyDisplayedPageID = page.pageID || -1;
    else throw new Error("Tried to set active page to a page that doesn't exist");
  }

  setPages(pages: PageModel[]): void {
    this.pages = pages;
    const sortedPages = this.pages.sort((a, b) => a.displayOrder - b.displayOrder);
    this.currentlyDisplayedPageID = sortedPages[0].pageID || -1;
  }

  addPage(item: PageModel): void {
    this.pages.push(item);
  }

  editPage(id: number, data: Partial<PageModel>): void {
    this.pages = this.pages.map((page) => {
      if (page.pageID === id) {
        if (typeof data.name == 'string') {
          page.name = data.name;
        }
        if (typeof data.displayOrder == 'number') {
          page.displayOrder = data.displayOrder;
        }
      }
      return page;
    })
  }

  deletePage(id: number): void {
    this.pages = this.pages.filter((page) => page.pageID !== id);
  }

  // UserFeeds
  addUserFeed(pageID: number, userFeed: UserFeedModel): void {
    try {
      const page: PageModel | undefined = this.pages.find(p => p.pageID === pageID);
      if (!page) { throw new Error('Asked to add userFeed to page that doesnt exist'); }
      // page.addUserFeed(userFeed);
      page.userFeeds.push(userFeed);
    } catch (err) {
      throw new Error('Error calling PageStore.addUserFeed: ' + err.toString());
    }
  }

  editUserFeed(feedSourceID: number, pageID: number, data: Partial<UserFeedModel>): void {
    this.pages.map((page) => {
      if (page.pageID === pageID) {
        page.userFeeds.map(userFeed => {
          if (userFeed.feedSourceID === feedSourceID) {
            if (typeof data.column == 'number') {
              userFeed.column = data.column;
            }
            if (typeof data.displayOrder == 'number') {
              userFeed.displayOrder = data.displayOrder;
            }
            if (typeof data.name == 'string') {
              userFeed.name = data.name;
            }
            if (typeof data.itemDisplayCount == 'number') {
              userFeed.itemDisplayCount = data.itemDisplayCount;
            }
          } // /if (userFeed.feedSourceID === feedSourceID) {
        })
      } // /if (page.pageID === pageID) {

      return page;
    })
  }

  deleteUserFeed(feedSourceID: number, pageID: number): void {
    const page: PageModel | undefined = this.pages.find((page) => page.pageID === pageID);
    if (page)
      page.userFeeds = page.userFeeds.filter((userFeed) => userFeed.feedSourceID !== feedSourceID);
  }

}

export default PageStore;
