import { observable, computed, action } from 'mobx';
import { PageModel } from '../../../../nffyi-common/models';

export class PageStore {

  constructor(fixtures: PageModel[]) {
    this.pages = fixtures;
    this.addPage = this.addPage.bind(this);
    this.deletePage = this.deletePage.bind(this);
    this.editPage = this.editPage.bind(this);
  }

  @observable
  public pages: Array<PageModel>;

  @action
  addPage(item: PageModel): void {
    this.pages.push(item);
  }

  @action
  editPage(id: number, data: Partial<PageModel>): void {
    this.pages = this.pages.map((page) => {
      if (page.pageID === id) {
        if (typeof data.name == 'string') {
          page.name = data.name;
        }
        if (typeof data.displayOrder == 'string') {
          page.displayOrder = data.displayOrder;
        }
      }
      return page;
    })
  }

  @action
  deletePage(id: number): void {
    this.pages = this.pages.filter((page) => page.pageID !== id);
  }

}

export default PageStore;
