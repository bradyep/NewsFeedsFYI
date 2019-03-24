import { observable, computed, action } from 'mobx';
// import { LinkModel } from '../../../../nffyi-common/models';
// import { LinkModel } from '../models/common';
import { LinkModel } from 'nffyi-common';

export class LinkStore {

  constructor(fixtures?: LinkModel[]) {
    if (fixtures) this.links = fixtures;
    else this.links = [];
    this.addLink = this.addLink.bind(this);
    this.deleteLink = this.deleteLink.bind(this);
    this.editLink = this.editLink.bind(this);
    this.clearOutLinks = this.clearOutLinks.bind(this);
  }

  @observable
  public links: Array<LinkModel>;

  @action
  addLink(item: LinkModel): void {
    this.links.push(item);
  }

  @action
  editLink(id: number, data: Partial<LinkModel>): void {
    this.links = this.links.map((link) => {
      if (link.linkID === id) {
        if (typeof data.url == 'string') {
          link.url = data.url;
        }
        if (typeof data.name == 'string') {
          link.name = data.name;
        }
        if (typeof data.displayOrder == 'number') {
          link.displayOrder = data.displayOrder;
        }
      }
      return link;
    })
  }

  @action
  deleteLink(id: number): void {
    this.links = this.links.filter((link) => link.linkID !== id);
  }

  @action
  clearOutLinks(): void {
    this.links = [];
  }

}

export default LinkStore;
