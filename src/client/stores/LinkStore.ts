import { observable, computed, action, makeObservable } from 'mobx';
import { LinkModel } from 'common/models';

export class LinkStore {

  public links: Array<LinkModel>;

  constructor(fixtures?: LinkModel[]) {
    // Make properties observable using makeObservable for MobX v6+
    makeObservable(this, {
      links: observable,
      addLink: action,
      editLink: action,
      deleteLink: action,
      clearOutLinks: action
    });

    if (fixtures) this.links = fixtures;
    else this.links = [];
    this.addLink = this.addLink.bind(this);
    this.deleteLink = this.deleteLink.bind(this);
    this.editLink = this.editLink.bind(this);
    this.clearOutLinks = this.clearOutLinks.bind(this);
  }

  addLink(item: LinkModel): void {
    this.links.push(item);
  }

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

  deleteLink(id: number): void {
    this.links = this.links.filter((link) => link.linkID !== id);
  }

  clearOutLinks(): void {
    this.links = [];
  }

}

export default LinkStore;
