import { Models } from "./Models";
import { RealField } from "./Field";
import { RequireAtLeastOne } from "./Types";
export declare namespace ServerUser {
    type CreateRequest = RealField.With.Request & Omit<Models.User, 'id' | 'activationLink'>;
    type UpdateRequest = RequireAtLeastOne<CreateRequest>;
    type Response = RealField.With.Response & Omit<Models.User, 'password' | 'activationLink'> & {
        customRoleName: string;
    };
    type IdResponse = Pick<Response, 'id'>;
}
