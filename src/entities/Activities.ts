import { Models } from "./Models";

export namespace Activities {
  export type Activity = {
    type: ActivityType;
    value: string;
  }

  export enum ActivityType {
    entityCreate,
    entityDelete,
    fieldChange,
  }

  export type Response = Omit<Models.Table.Activities, 'activities'> & { activities: Activity[] };
}
