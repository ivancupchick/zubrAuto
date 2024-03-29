export namespace CarFormEnumsStrings {
  export enum AdditionalStrings {
    description = 'Описание',
  }

  export enum CarQuestionnaire {
    country = 'Страна производства автомобиля?',
    firstSaleCountry = 'Страна первой продажи (Где покупал первый владелец?)',
    ownerCounty = 'Сколько было владельцев до Вас?',
    lastSaleWhere = 'Где Вы покупали авто?',
    lastSaleWhen = 'Когда Вы покупали авто?',
    lastSaleMileage = 'Какой пробег был при покупке?',
    bodyCondition = 'Есть ли царапины, вмятины, сколы, жуки? Где?',
    interiorCondition = 'Состояние салона автомобиля?',
    oilLeak = 'Есть ли течь масла?',
    oilLoss = 'Есть ли масложор?',
    suspensionCondition = 'Стучит/скрипит ли что-то по подвеске?',
    repairCondition = 'Что нужно чинить?',
    activeErrors = 'Есть ли активные ошибки на панели приборов?',
    inCarDoesntWork = 'Что не работает в автомобиле?',
    whereWasServed = 'Где обслуживалась?',
    serviceHistory = 'Есть ли сервисная история?',
    serviceOrders = 'Остались ли заказ-наряды?',
    dateOrMileageOfLastMaintenance = 'Дата/Пробег последнего ТО?',
    repairOfLastMaintenance = 'Что делали на последнем ТО?',
    carEquipment = 'Комплектация (стандартная, пред максимальная или максимальная?)',
    officialEquipmentName = 'Название заводской комплектации?',
    oilChangeDate = 'Когда менялось масло в АКПП?',
    engineChainChangeWhen = 'Когда менялся Ремень/цепь ГРМ?',
    WDMaintenanceDate = 'Когда обслуживался полный привод?',
    fuelСonsumption = 'Какой расход топлива?',
  }

  export enum GeneralCondition {
    documentOwner = 'Вы хозяин по техпаспорту?',
    ownerGrade = 'Как вы оцениваете состояние вашего авто по 5-ти бальной шкале?',
    saleReason = 'Почему решили продать?',
    termSelling = 'Как давно продаете?',
    harrySelling = 'Торопитесь ли с продажей?',
    callFrequency = 'Часто ли звонят по вашему объявлению?',
    costProposals = 'Были ли предложения по стоимости?',
    sumProposals = 'Какую сумму Вам предлагали за Ваш автомобиль?',
    expectedSum = 'Укажите сумму, которую хотите на руки за ваш автомобиль?',
    reasonExpectedSum = 'Чем аргументируете Вашу цену?',
    stateNumbers = 'Ваш автомобиль на номерах или транзитах?',
    leasing = 'Находится ли автомобиль в залоге у банка, либо в лизинге?',
    readyToSale = 'При нахождении покупателя, готовы ли Вы сразу (в течение 1-2 дней) продать автомобиль?',
    testDriveAvailable = 'Согласны ли вы на проведение потенциальным клиентом тест-драйва за рулём Вашего автомобиля? ',
    additionalContact = 'Укажите дополнительное контактное лицо, в случае Вашего отсутствия (Имя, номер телефона)',
  }

  export enum Inspection {
    date = 'дата',
    name = 'Имя',
    number = 'Телефон',
    vin = 'VIN',
    brandModel = 'Марка / модель',
    capacity = 'Объем двигателя (см3)',
    color = 'Цвет',
    power = 'Мощность (л.с.)',
    seats = 'Количество мест',
    fuel = 'Топливо',
    year = 'Год выпуска',
    transmission = 'Коробка передач',
    mileage = 'Пробег, км.',
    guarantee = 'Гарантия',
    termGuarantee = 'Срок действия',
    driveType = 'Привод',
    stateInspection = 'Тех осмотр',
    termStateInspection = 'Срок действия',
    valueAddedTax = 'Для юридических лиц:  Автомобиль с НДС: ',
    bodyCondition = 'Состояние ЛКП',
    engineCondition = 'Состояние мотора: ',
    interiorCondition = 'Состояние салона: ',
    exteriorCondition = 'Состояние кузова: ',
  }

  export enum ExteriorInspection {
    rightFrontFender = '',
    rightFrontDoor = '',
    rightRearDoor = '',
    rightRearFender = '',
    leftFrontFender = '',
    leftFrontDoor = '',
    leftRearDoor = '',
    leftRearFender = '',
    hood = '',
    roof = '',
    trunk = '',
  }

  export enum Checkboxes {
    serviceHistory = 'Сервисная книжка',
    guide = 'Инструкция по эксплуатации',
    halogen = 'Галогеновые фары',
    xenon = 'Ксеноновые фары',
    steediodes = 'Светодиодные фары',
    LEDDRL = 'Светодиодные ДХО',
    fogLights = 'Противотуманные фары',
    heatedWindshield = 'Подогрев лобового стекла',
    heatedSteeringWheel = 'Подогрев руля',
    heatedFrontSeats = 'Подогрев передних сидений',
    heatedRearSeats = 'Подогрев задних сидений',
    lightSensor = 'Датчик света',
    rainSensor = 'Датчик дождя',
    tintedGlass = 'Тонированные стекла',
    luke = 'Люк',
    panoramicView = 'Панорамная крыша',
    airConditioning = 'Кондиционер',
    climateControl = 'Климат-контроль',
    monochromeDisplay = 'Монохромный дисплей',
    colorDisplay = 'Цветной дисплей',
    rearSeatScreens = 'Экраны на задних сиденьях',
    textile = 'Ткань',
    combined = 'Комбинированный',
    leather = 'Кожа',
    secondNonHave = 'Нет',
    secondTires = 'Резина',
    secondTiresWithDisks = 'Резина + диска',
    secondTiresR = 'R',
    summerTires = 'Летняя',
    winterTires = 'Зимняя',
    winterTiresR = 'R',
    multifunction = 'Мультируль',
    frontParkingSensors = 'Парктроники передние',
    rearParkingSensors = 'Парктроники задние',
    blindSpotIndicator = 'Индикатор слепых зон',
    frontViewCamera = 'Камера переднего вида',
    rearViewCamera = 'Камера заднего вида',
    camera360 = 'Камера 360',
    headUpDisplay = 'Проекционный дисплей',
    laneDepartureIndicator = 'Индикатор движения по полосе',
    carParkingSystem = 'Система автопарковки',
    cruiseControl = 'Круиз-контроль',
    adaptiveCruiseControl = 'Адаптивный круиз-контроль',
    automaticHighLowBeam = 'Автоматический дальний/ближний свет',
    electricallyAdjustableSeats = 'Электрорегулировка сидений',
    seatMemory = 'Память сидений',
    seatVentilation = 'Вентиляция сидений',
    powerMirrors = 'Электропривод зеркал',
    electroFoldingMirrors = 'Электроскладывание зеркал',
    trunkElectricDrive = 'Электропривод багажника',
    doorPresses = 'Дожимы дверей',
    leatherSteeringWheel = 'Кожаный руль',
    signaling = 'Сигнализация',
    airSuspension = 'Пневмоподвеска',
    premiumAcoustics = 'Премиум акустика',
    premiumAcousticsNames = 'Название акустики',
    towbar = 'Фаркоп',
    startStopSystem = 'Система Start/Stop',
    engineStartButton = 'Запуска двигателя кнопкой',
    keylessAccess = 'Безключевой доступ',
    roofRails = 'Рейлинги на крыше',
    trafficSignRecognition = 'Распознавание дорожных знаков',
    numberOfKeys = 'Количество ключей',
  }
}
