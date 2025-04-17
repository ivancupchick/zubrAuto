import { Models } from "./Models";
export declare namespace CarStatistic {
    enum Type {
        call = 0,
        showing = 1,
        customerCall = 2,
        customerDiscount = 3
    }
    interface ShowingContent {
        date: number;
        status: ShowingStatus;
        comment: string;
        clientId: number;
    }
    interface DiscountContent {
        amount: number;
        discount: number;
    }
    enum ShowingStatus {
        cancel = "\u041E\u0442\u043C\u0435\u043D\u0430",
        plan = "\u0417\u0430\u043F\u043B\u0430\u043D\u0438\u0440\u043E\u0432\u0430\u043D",
        success = "\u041F\u0440\u043E\u0438\u0437\u0432\u0435\u0434\u0435\u043D"
    }
    type BaseResponse = Omit<Models.CarStatistic, 'type'> & {
        type: CarStatistic.Type;
    };
    type CarShowingResponse = Omit<BaseResponse, 'content'> & {
        content: string | ShowingContent | DiscountContent;
    };
}
