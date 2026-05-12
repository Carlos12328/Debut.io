import { AppModel } from '../models/AppModel';

export class AppPresenter {
  getInitialState(): AppModel {
    return {
      welcomeMessage: 'Bem-vindo ao Debut.io',
    };
  }
}
