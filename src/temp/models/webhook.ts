export namespace Webhook {
  export type Notification = StartNotification | StateNotification | FinishNotification;

  export interface StartNotification {
    notificationType: NotificationType.Start,
    companyId: number,
    crmCallType: CallType,
    numberA: string,
    numberB: string,
    lineNumber: string,
    dialType: string,
    date: string,
    uuid: string
  }
  export interface StateNotification {
    notificationType: NotificationType.State,
    companyId: 732,
    numberA: string,
    numberB: string,
    uuid: string,
    crmCallState: CallState
  }
  export interface FinishNotification {
    notificationType: NotificationType.Finish,
    companyId: 732,
    crmCallType: CallType,
    numberA: string,
    numberB: string,
    lineNumber: string,
    dialType: DialTyoe,
    uuid: string,
    recordName: string,
    duration: 9,
    crmCallFinishedStatus: CallFinishedStatus,
    isCallFinished: true,
    fullUrl: string
  }

  export enum NotificationType {
    Start = 'START',
    State = 'STATE',
    Finish = 'FINISH'
  }

  export enum CallType {
    Inbound = 'INBOUND',
    Outbound = 'OUTBOUND',
    Internal = 'INTERNAL'
  }

  export enum CallState {
    Up = 'UP',
    Down = 'DOWN'
  }

  export enum DialTyoe {
    Single = 'SINGLE',
    Same_Time = 'SAME_TIME',
    Sequential = 'SEQUENTIAL'
  }

  export enum CallFinishedStatus {
    Answered = 'ANSWERED',
    Not_Answered = 'NOT_ANSWERED',
    Cancelled = 'CANCELLED',
    Busy = 'BUSY',
    Denied = 'DENIED'
  }
}
