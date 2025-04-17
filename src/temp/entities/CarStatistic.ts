import { Models } from './Models';

export namespace CarStatistic {
  export enum Type {
    call,
    showing,
    customerCall,
    customerDiscount,
  }

  export interface ShowingContent {
    date: number;
    status: ShowingStatus;
    comment: string;
    clientId: number;
  }

  export interface DiscountContent {
    amount: number;
    discount: number;
  }

  export enum ShowingStatus {
    cancel = 'Отмена',
    plan = 'Запланирован',
    success = 'Произведен',
  }

  export type BaseResponse = Omit<Models.CarStatistic, 'type'> & {
    type: CarStatistic.Type;
  };
  export type CarShowingResponse = Omit<BaseResponse, 'content'> & {
    content: string | ShowingContent | DiscountContent;
  };
}
