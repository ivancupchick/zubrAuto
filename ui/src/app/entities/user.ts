import { ServerUser as user } from '../../../../src/temp/entities/User';
import { ServerAuth as auth } from '../../../../src/temp/entities/Auth';

export import ServerUser = user;
export import ServerAuth = auth;

export enum LocalStorageKey {
  Token = 'token'
}
