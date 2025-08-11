import { observable, computed, action, makeObservable } from 'mobx';
import { PageModel, UserFeedModel } from 'common/models';
import { EditableUserFeedModel } from 'common/models/UserFeedModel';
import debug from 'debug';
const log = debug('webapp:PageStore');
const error = debug('webapp:PageStore:error');

export class PageStore {

  // Pages
  public pages: Array<PageModel>;
  public currentlyDisplayedPageID: number;
  public userFeedBeingEdited?: EditableUserFeedModel;

  constructor(fixtures: PageModel[]) {
    // Make properties observable using makeObservable for MobX v6+
    makeObservable(this, {
      pages: observable,
      currentlyDisplayedPageID: observable,
      userFeedBeingEdited: observable,
      setUserFeedBeingEdited: action,
      updateUserFeedBeingEdited: action,
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

  setUserFeedBeingEdited(userFeed: EditableUserFeedModel | undefined): void {
    this.userFeedBeingEdited = userFeed;
  }

  updateUserFeedBeingEdited(partialUpdate: Partial<EditableUserFeedModel>): void {
    if (this.userFeedBeingEdited) {
      this.userFeedBeingEdited = { ...this.userFeedBeingEdited, ...partialUpdate };
    } else {
      error('Tried to update userFeedBeingEdited but it is undefined');
    }
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

  editUserFeed(userFeedID: number, data: Partial<UserFeedModel>): void {
    const existingUserFeed = this.pages.flatMap(page => page.userFeeds).find(uf => uf.userFeedID === userFeedID);
    if (!existingUserFeed) {
      log('Failed to update UserFeed - userFeed not found');
      return;
    }

    // Store the original pageID before making any changes
    const originalPageID = existingUserFeed.pageID;

    if (typeof data.column == 'number') {
      existingUserFeed.column = data.column;
    }
    if (typeof data.row == 'number') {
      existingUserFeed.row = data.row;
    }
    if (typeof data.name == 'string') {
      existingUserFeed.name = data.name;
    }
    if (typeof data.itemDisplayCount == 'number') {
      existingUserFeed.itemDisplayCount = data.itemDisplayCount;
    }

    // Check if pageID is changing using the original value
    if (typeof data.pageID == 'number' && originalPageID !== data.pageID) {
      // Remove UserFeed from old page
      const oldPage = this.pages.find(p => p.pageID === originalPageID);
      if (oldPage) {
        oldPage.userFeeds = oldPage.userFeeds.filter(uf => uf.userFeedID !== userFeedID);
      }
      // Update the pageID on the UserFeed object
      existingUserFeed.pageID = data.pageID;
      // Add UserFeed to new page
      const newPage = this.pages.find(p => p.pageID === data.pageID);
      if (newPage) {
        newPage.userFeeds.push(existingUserFeed);
      }
    }
  }

  deleteUserFeed(userFeedID: number): void {
    this.pages.map((page) => {
      page.userFeeds = page.userFeeds.filter((userFeed) => userFeed.userFeedID !== userFeedID);
      return page;
    })
  }

}

export default PageStore;
