import { FieldNames } from 'src/app/entities/FieldNames';

export const StatusesByAdmin = [
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
];
1;
export const StatusesByMyCallBaseReady = [
  FieldNames.CarStatus.carShooting_InProgres,
  FieldNames.CarStatus.carShooting_Refund,
  FieldNames.CarStatus.carShooting_Ready,
  FieldNames.CarStatus.customerService_InProgress,
  FieldNames.CarStatus.customerService_OnPause,
  FieldNames.CarStatus.customerService_OnDelete,
  FieldNames.CarStatus.customerService_Sold,
  FieldNames.CarStatus.carSales_Deposit,
  FieldNames.CarStatus.admin_Deleted,
];

// same as StatusesByMyCallBaseReady
export const StatusesByAllCallBaseReady = [
  FieldNames.CarStatus.carShooting_InProgres,
  FieldNames.CarStatus.carShooting_Refund,
  FieldNames.CarStatus.carShooting_Ready,
  FieldNames.CarStatus.customerService_InProgress,
  FieldNames.CarStatus.customerService_OnPause,
  FieldNames.CarStatus.customerService_OnDelete,
  FieldNames.CarStatus.customerService_Sold,
  FieldNames.CarStatus.carSales_Deposit,
  FieldNames.CarStatus.admin_Deleted,
];

export const StatusesByAllCallBase = [
  FieldNames.CarStatus.contactCenter_WaitingShooting,
  FieldNames.CarStatus.contactCenter_InProgress,
  FieldNames.CarStatus.contactCenter_Deny,
  FieldNames.CarStatus.contactCenter_MakingDecision,
  FieldNames.CarStatus.contactCenter_NoAnswer,
  FieldNames.CarStatus.contactCenter_Refund,
];

export const StatusesByMyShootingBase = [
  FieldNames.CarStatus.carShooting_InProgres,
  FieldNames.CarStatus.carShooting_Refund,
  FieldNames.CarStatus.carShooting_Ready,
];

// same as StatusesByMyShootingBase
export const StatusesByAllShootingBase = [
  FieldNames.CarStatus.carShooting_InProgres,
  FieldNames.CarStatus.carShooting_Refund,
  FieldNames.CarStatus.carShooting_Ready,
];

export const StatusesCarsForSaleTemp = [
  FieldNames.CarStatus.carShooting_Ready,
  FieldNames.CarStatus.customerService_InProgress,
  FieldNames.CarStatus.customerService_OnPause,
  FieldNames.CarStatus.customerService_OnDelete,
  FieldNames.CarStatus.customerService_Sold,
];

export const StatusesByMyCallBase = [
  FieldNames.CarStatus.contactCenter_WaitingShooting,
  FieldNames.CarStatus.contactCenter_InProgress,
  FieldNames.CarStatus.contactCenter_Deny,
  FieldNames.CarStatus.contactCenter_MakingDecision,
  FieldNames.CarStatus.contactCenter_NoAnswer,
  FieldNames.CarStatus.contactCenter_Refund,
];

export const StatusesByShootedBase = [FieldNames.CarStatus.carShooting_Ready];

export const StatusesByCarsForSale = [
  FieldNames.CarStatus.customerService_InProgress,
  FieldNames.CarStatus.customerService_OnPause,
  FieldNames.CarStatus.customerService_OnDelete,
  FieldNames.CarStatus.customerService_Sold,
];
