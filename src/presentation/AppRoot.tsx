import { AppPresenter } from './mvp/presenters/AppPresenter';
import { AppView } from './mvp/views/AppView';

export function AppRoot() {
  const presenter = new AppPresenter();
  const state = presenter.getInitialState();

  return <AppView message={state.welcomeMessage} />;
}
