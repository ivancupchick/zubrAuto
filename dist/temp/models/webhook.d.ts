export declare namespace Webhook {
    type Notification = StartNotification | StateNotification | FinishNotification;
    interface StartNotification {
        notificationType: NotificationType.Start;
        companyId: number;
        crmCallType: CallType;
        numberA: string;
        numberB: string;
        lineNumber: string;
        dialType: string;
        date: string;
        uuid: string;
    }
    interface StateNotification {
        notificationType: NotificationType.State;
        companyId: 732;
        numberA: string;
        numberB: string;
        uuid: string;
        crmCallState: CallState;
    }
    interface FinishNotification {
        notificationType: NotificationType.Finish;
        companyId: 732;
        crmCallType: CallType;
        numberA: string;
        numberB: string;
        lineNumber: string;
        dialType: DialTyoe;
        uuid: string;
        recordName: string;
        duration: 9;
        crmCallFinishedStatus: CallFinishedStatus;
        isCallFinished: true;
        fullUrl: string;
    }
    enum NotificationType {
        Start = "START",
        State = "STATE",
        Finish = "FINISH"
    }
    enum CallType {
        Inbound = "INBOUND",
        Outbound = "OUTBOUND",
        Internal = "INTERNAL"
    }
    enum CallState {
        Up = "UP",
        Down = "DOWN"
    }
    enum DialTyoe {
        Single = "SINGLE",
        Same_Time = "SAME_TIME",
        Sequential = "SEQUENTIAL"
    }
    enum CallFinishedStatus {
        Answered = "ANSWERED",
        Not_Answered = "NOT_ANSWERED",
        Cancelled = "CANCELLED",
        Busy = "BUSY",
        Denied = "DENIED"
    }
}
