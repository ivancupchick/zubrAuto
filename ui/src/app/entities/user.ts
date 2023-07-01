import { ServerUser as user } from '../../../../src/entities/User';
import { ServerAuth as auth } from '../../../../src/entities/Auth';

export import ServerUser = user;
export import ServerAuth = auth;

export enum LocalStorageKey {
  Token = 'token'
}
