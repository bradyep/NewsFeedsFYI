import { observable, computed, action } from 'mobx';
import { LinkModel } from '../../../../nffyi-common/models';

export class LinkStore {

  constructor(fixtures: LinkModel[]) {
    this.links = fixtures;
    this.addLink = this.addLink.bind(this);
    this.deleteLink = this.deleteLink.bind(this);
    this.editLink = this.editLink.bind(this);
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
        if (typeof data.displayOrder == 'string') {
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

}

export default LinkStore;
