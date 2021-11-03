import { Models } from "./Models";

export namespace ServerAuth {
  export type IPayload = Pick<Models.User, 'id' | 'email' | 'isActivated' | 'roleLevel'>

  export class Payload implements IPayload{
    public id: number;
    public email: string;
    public isActivated: boolean;
    public roleLevel: number;

    constructor(options: Models.User) {
      this.id = options.id;
      this.email = options.email;
      this.isActivated = options.isActivated;
      this.roleLevel = options.roleLevel;
    }
  }

  export interface AuthGetResponse {
    user: IPayload,
    accessToken: string,
    refreshToken: string
  }
}
