import { FieldNames } from "src/app/entities/FieldNames";

export enum QueryCarTypes {
  byAdmin = 'by-admin',
  myCallBase = 'my-call-base',
  myCallBaseReady = 'my-call-base-ready',
  allCallBase = 'all-call-base',
  allCallBaseReady = 'all-call-base-ready',
  myShootingBase = 'my-shooting-base',
  allShootingBase = 'all-shooting-base',
  shootedBase = 'shooted-base',
  carsForSale = 'cars-for-sale',
  carsForSaleTemp = 'cars-for-sale-temp',
}

export const CarStatusLists = {
  [QueryCarTypes.byAdmin]: [ // all statuses
    FieldNames.CarStatus.contactCenter_InProgress,
    FieldNames.CarStatus.contactCenter_NoAnswer,
    FieldNames.CarStatus.contactCenter_MakingDecision,
    FieldNames.CarStatus.contactCenter_WaitingShooting,
    FieldNames.CarStatus.contactCenter_Deny,
    FieldNames.CarStatus.contactCenter_Refund,
    FieldNames.CarStatus.carShooting_InProgres,
    FieldNames.CarStatus.carShooting_Refund,
    FieldNames.CarStatus.carShooting_Ready,
    FieldNames.CarStatus.customerService_InProgress,
    FieldNames.CarStatus.customerService_OnPause,
    FieldNames.CarStatus.customerService_OnDelete,
    FieldNames.CarStatus.customerService_Sold,
    FieldNames.CarStatus.carSales_Deposit,
    FieldNames.CarStatus.admin_Deleted,
  ],
  [QueryCarTypes.carsForSale]: [
    FieldNames.CarStatus.customerService_InProgress,
    FieldNames.CarStatus.customerService_OnPause,
    FieldNames.CarStatus.customerService_OnDelete,
    FieldNames.CarStatus.customerService_Sold
  ],
};
