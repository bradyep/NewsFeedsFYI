import { render, RenderOptions } from '@testing-library/react';
import React, { ReactElement } from 'react';
import { Provider } from 'mobx-react';
import { UserStore, LinkStore, PageStore } from '../../client/stores';
import { mockUser, mockPage } from '../fixtures/mockData';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialUser?: any;
  initialPages?: any[];
  initialLinks?: any[];
}

export const renderWithStores = (
  ui: ReactElement,
  {
    initialUser = mockUser,
    initialPages = [mockPage],
    initialLinks = [],
    ...renderOptions
  }: CustomRenderOptions = {}
) => {
  const userStore = new UserStore(initialUser);
  const pageStore = new PageStore(initialPages);
  const linkStore = new LinkStore();
  
  initialLinks.forEach(link => linkStore.addLink(link));

  const stores = {
    user: userStore,
    page: pageStore,
    link: linkStore
  };

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider {...stores}>
      {children}
    </Provider>
  );

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    stores
  };
};

export * from '@testing-library/react';
export { renderWithStores as render };
