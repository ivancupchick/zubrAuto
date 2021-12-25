import { Models } from "./Models";

export namespace CarStatistic {
  export enum Type {
    call,
    showing
  }

  export interface ShowingContent {
    date: number;
    status: ShowingStatus;
    comment: string;
    clientId: number;
  }

  export enum ShowingStatus {
    cancel = 'Отмена',
    plan = 'Запланирован',
    success = 'Произведен',
  }

  export type CarShowingResponse = Omit<Models.CarStatistic, 'content'> & { content: ShowingContent }
}
