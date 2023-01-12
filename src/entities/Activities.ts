import { Models } from "./Models";

export namespace Activities {
  export type Activity = {
    type: ActivityType;
    oldValue: string; // ?
    value: string;
  }

  export enum ActivityType {
    entityCreate,
    entityDelete,
    fieldChange,
  }

  export type Response = Omit<Models.Activities, 'activities'> & { activities: Activity[] };
}
