export namespace FieldNames {
  export enum Client {
    date = 'date',
    source = 'source',
    name = 'name',
    number = 'number',
    email = 'email',
    paymentType = 'payment-type',
    nextAction = 'next-action',
    tradeInAuto = 'trade-in-auto',
    dealStatus = 'deal-status',
    comment = 'comment',
    dateNextAction = 'date-next-action',
    clientStatus = 'client-status',
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
    linkToAd = 'link-to-ad', // dont change this please never (car import)
    carOwnerPrice = 'car-owner-price',
    commission = 'commission',
    comment = 'comment',
    dateOfLastStatusChange = 'date-of-last-status-change',
    dateOfLastCustomerCall = 'date-of-last-customer-call',
    worksheet = 'worksheet',
    bargain = 'bargain',
    adPrice = 'ad-price',
    shootingDate = 'shooting-date',
    shootingTime = 'shooting-time',
    ourLinks = 'our-links',
    contactCenterSpecialistId = 'contact-center-specialist-id',
    carShootingSpecialistId = 'car-shooting-specialist-id',
    source = "source",
    statistic = 'statistic',
    bodyType = 'body-type',
    contactCenterSpecialist = 'contact-center-specialist',
    mainPhotoId = 'main-photo-id',
    linkToVideo = 'link-to-video',
    dateOfNextAction = 'date-of-next-action',
    dateOfFirstStatusChange = 'date-of-first-status-change',
    oldWorksheet = 'old-worksheet',
  }

  export enum CarStatus {
    none = '',
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

  export enum ClientStatus {
    InProgress = 'Идёт оформление',
    Thinking = 'Думает',
    HavingWaiting = 'Ждёт наличие',
    ProposalWaiting = 'Ждёт предложение',
    AppointmentSigned = 'Записан на ТД',
  }

  export enum CarOwner {
    name = 'name',
    ownerNumber = 'ownerNumber'
  }

  export enum User {
    name = 'name'
  }
}

export namespace CarFormEnums {
  export enum CarQuestionnaire {
    country = 'country',
    firstSaleCountry = 'firstSaleCountry',
    ownerCounty = 'ownerCounty',
    lastSaleWhere = 'lastSaleWhere',
    lastSaleWhen = 'lastSaleWhen',
    lastSaleMileage = 'lastSaleMileage',
    bodyCondition = 'bodyCondition',
    interiorCondition = 'interiorCondition',
    oilLeak = 'oilLeak',
    oilLoss = 'oilLoss',
    suspensionCondition = 'suspensionCondition',
    repairCondition = 'repairCondition',
    activeErrors = 'activeErrors',
    inCarDoesntWork = 'inCarDoesntWork',
    whereWasServed = 'whereWasServed',
    serviceHistory = 'serviceHistory',
    serviceOrders = 'serviceOrders',
    dateOrMileageOfLastMaintenance = 'dateOrMileageOfLastMaintenance',
    repairOfLastMaintenance = 'repairOfLastMaintenance',
    carEquipment = 'carEquipment',
    officialEquipmentName = 'officialEquipmentName',
    oilChangeDate = 'oilChangeDate',
    engineChainChangeWhen = 'engineChainChangeWhen',
    WDMaintenanceDate = 'WDMaintenanceDate',
    fuelСonsumption = 'fuelСonsumption',
  }

  export enum GeneralCondition {
    documentOwner = 'documentOwner',
    ownerGrade = 'ownerGrade',
    saleReason = 'saleReason',
    termSelling = 'termSelling',
    harrySelling = 'harrySelling',
    callFrequency = 'callFrequency',
    costProposals = 'costProposals',
    sumProposals = 'sumProposals',
    expectedSum = 'expectedSum',
    reasonExpectedSum = 'reasonExpectedSum',
    stateNumbers = 'stateNumbers',
    leasing = 'leasing',
    readyToSale = 'readyToSale',
    testDriveAvailable = 'testDriveAvailable',
    additionalContact = 'additionalContact',
  }

  export enum Inspection {
    date = 'date',
    name = 'name',
    number = 'number',
    vin = 'vin',
    brandModel = 'brandModel',
    capacity = 'capacity',
    color = 'color',
    power = 'power',
    seats = 'seats',
    fuel = 'fuel',
    year = 'year',
    transmission = 'transmission',
    mileage = 'mileage',
    guarantee = 'guarantee',
    termGuarantee = 'termGuarantee',
    driveType = 'driveType',
    stateInspection = 'stateInspection',
    termStateInspection = 'termStateInspection',
    valueAddedTax = 'valueAddedTax',
    // bodyCondition = 'bodyCondition',
    engineCondition = 'engineCondition',
    interiorCondition = 'interiorCondition',
    exteriorCondition = 'exteriorCondition',
  }

  export enum ExteriorInspection {
    rightFrontFender = 'rightFrontFender',
    rightFrontDoor = 'rightFrontDoor',
    rightRearDoor = 'rightRearDoor',
    rightRearFender = 'rightRearFender',
    leftFrontFender = 'leftFrontFender',
    leftFrontDoor = 'leftFrontDoor',
    leftRearDoor = 'leftRearDoor',
    leftRearFender = 'leftRearFender',
    hood = 'hood',
    roof = 'roof',
    trunk = 'trunk',
  }

  export enum Checkboxes {
    serviceHistory = 'serviceHistory',
    guide = 'guide',
    halogen = 'halogen',
    xenon = 'xenon',
    steediodes = 'steediodes',
    LEDDRL = 'LEDDRL',
    fogLights = 'fogLights',
    heatedWindshield = 'heatedWindshield',
    heatedSteeringWheel = 'heatedSteeringWheel',
    heatedFrontSeats = 'heatedFrontSeats',
    heatedRearSeats = 'heatedRearSeats',
    lightSensor = 'lightSensor',
    rainSensor = 'rainSensor',
    tintedGlass = 'tintedGlass',
    luke = 'luke',
    panoramicView = 'panoramicView',
    airConditioning = 'airConditioning',
    climateControl = 'climateControl',
    monochromeDisplay = 'monochromeDisplay',
    colorDisplay = 'colorDisplay',
    rearSeatScreens = 'rearSeatScreens',
    textile = 'textile',
    combined = 'combined',
    leather = 'leather',
    secondNonHave = 'secondNonHave',
    secondTires = 'secondTires',
    secondTiresWithDisks = 'secondTiresWithDisks',
    secondTiresR = 'secondTiresR',
    summerTires = 'summerTires',
    winterTires = 'winterTires',
    winterTiresR = 'winterTiresR',
    multifunction = 'multifunction',
    frontParkingSensors = 'frontParkingSensors',
    rearParkingSensors = 'rearParkingSensors',
    blindSpotIndicator = 'blindSpotIndicator',
    frontViewCamera = 'frontViewCamera',
    rearViewCamera = 'rearViewCamera',
    camera360 = 'camera360',
    headUpDisplay = 'headUpDisplay',
    laneDepartureIndicator = 'laneDepartureIndicator',
    carParkingSystem = 'carParkingSystem',
    cruiseControl = 'cruiseControl',
    adaptiveCruiseControl = 'adaptiveCruiseControl',
    automaticHighLowBeam = 'automaticHighLowBeam',
    electricallyAdjustableSeats = 'electricallyAdjustableSeats',
    seatMemory = 'seatMemory',
    seatVentilation = 'seatVentilation',
    powerMirrors = 'powerMirrors',
    electroFoldingMirrors = 'electroFoldingMirrors',
    trunkElectricDrive = 'trunkElectricDrive',
    doorPresses = 'doorPresses',
    leatherSteeringWheel = 'leatherSteeringWheel',
    signaling = 'signaling',
    airSuspension = 'airSuspension',
    premiumAcoustics = 'premiumAcoustics',
    premiumAcousticsNames = 'premiumAcousticsNames',
    towbar = 'towbar',
    startStopSystem = 'startStopSystem',
    engineStartButton = 'engineStartButton',
    keylessAccess = 'keylessAccess',
    roofRails = 'roofRails',
    trafficSignRecognition = 'trafficSignRecognition',
    numberOfKeys = 'numberOfKeys',
  }
}
