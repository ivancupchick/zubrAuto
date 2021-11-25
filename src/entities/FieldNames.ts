export namespace FieldNames {
  export enum Client {
    date = 'date',
    source = 'source',
    name = 'name',
    number = 'number',
    email = 'email',
    paymentType = 'payment-type',
    tradeInAuto = 'trade-in-auto',
    dealStatus = 'deal-status',
  }

  export enum Car {
    status = 'status',
    engine = 'engine',
    engineCapacity = 'engine-capacity',
    mileage = 'mileage',
    year = 'year',
    mark = 'mark',
    model = 'model',
    transmission = 'transmission',
    color = 'color',
    driveType = 'drive-type',
    linkToAd = 'link-to-ad',
    carOwnerPrice = 'car-owner-price',
    commission = 'commission',
    comment = 'comment',
    dateOfLastStatusChange = 'date-of-last-status-change',
    worksheet = 'worksheet',
    bargain = 'bargain',
    adPrice = 'ad-price',
    shootingDate = 'shooting-date',
    shootingTime = 'shooting-time',
    ourLinks = 'our-links',
    contactCenterSpecialistId = 'contact-center-specialist-id',
    carShootingSpecialistId = 'car-shooting-specialist-id',
    source = "source",
  }

  export enum CarStatus {
    contactCenter_InProgress = '[ОКЦ]В работе',
    contactCenter_NoAnswer = '[ОКЦ]Недозвон',
    contactCenter_MakingDecision = '[ОКЦ]Принимает решение',
    contactCenter_WaitingShooting = '[ОКЦ]Ожидание съемки',
    contactCenter_Deny = '[ОКЦ]Отказ',
    contactCenter_Refund = '[ОКЦ]Возврат от ОСА',
    carShooting_InProgres = '[ОСА]в работе',
    carShooting_Refund = '[ОСА]Возврат от ОРК',
    carShooting_Ready = '[ОСА]готов',
    customerService_InProgress = '[ОРК]в работе', // ОРК, ОПА
    customerService_OnPause = '[ОРК]на паузе',
    customerService_OnDelete = '[ОРК]на удаление',
    customerService_Sold = '[ОРК]продана',
    carSales_Deposit = '[ОПА]Дан задаток',
    admin_Deleted = '[Админ]Удалена',
  }

  export enum DealStatus {
    InProgress = 'В работе',
    Deny = 'Отказ',
    Sold = 'Продано',
    OnDeposit = 'Дал задаток',
  }

  export enum CarOwner {
    name = 'name',
    ownerNumber = 'ownerNumber'
  }

  export enum User {
    name = 'name'
  }
}
