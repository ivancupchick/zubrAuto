import { ServerFile as serverFile } from '../../../../src/entities/File'
import { ServerCar as serverCar } from '../../../../src/entities/Car'
import { ServerCarImage as serverCarImage } from '../../../../src/entities/Car'
import { CarQuestionnaireEnums as carQuestionnaire } from '../../../../src/entities/FieldNames';
import { CarStatistic as carStatistic } from '../../../../src/entities/CarStatistic';
import { FieldsUtils } from './field';
import { FieldNames } from './FieldNames';

export const descriptionTemplate = `<p>Внимание! Осмотр автомобиля по предварительному согласованию.</p><p>В техпаспорте ___г.</p><p>Из Германии/Франции/Бельгии/Италии.</p><p>Приобреталась у официального дилера в Минске.</p><p>Один владелец.</p><p>Оригинальный пробег. Подтвержден заказ-нарядами от официального дилера.</p><p>Всё сервисное обслуживание по регламенту.</p><p>На 164.000 км. сделано плановое ТО: масло в двигателе, фильтра, обслужена подвеска.&nbsp;</p><p>На 108.000км. сделана замена ГРМ.</p><p>На 145.000км. сделана замена масла в АКПП.</p><p>На 108.000км. обслужена система полного привода.</p><p>Бережная эксплуатация.</p><p>Чистый и ухоженный салон.</p><p>Установлен надежный и экономичный / высокотехнологичный 3.0-литровый&nbsp;бензиновый/дизельный турбированный/атмосферный двигатель. Мощность 310 л/с. Надежная АКПП-8.</p><p>Максимальная / предмаксимальная / оптимальная комплектация: LED-приборная панель, бесключевой доступ, светодиодные / ксеноновые фары головного света, светодиодные ДХО, шикарный мультиконтурный кожаный салон, дожимы дверей, премиальная акустика, проекционный дисплей, заводская тонировка, полный эл/пакет, мультируль, автоматическое переключение ближнего/дальнего света, адаптивный круиз-контроль, климат-контроль/кондиционер, система контроля мертвых зон, контроль полосы, система предотвращения столкновения с функцией автоматического торможения, парктроники передние/задние + камера 360, мультимедийная система + громкая связь + CARPLAY + ANDROiD, эл/привод крышки багажника, эл/привод передних сидений с памятью, эл/привод задних сидений с памятью, подогрев передних/задних сидений + вентиляция передних сидений, подогрев руля, подогрев лобового стекла, мультимедийная система для задних пассажиров, черный потолок, пневмоподвеска, панорамная крыша / эл/люк, и многое другое...</p><p>Отличное состояние.</p><p>Два комплекта резины зима R17 + лето R20.&nbsp;</p><p>Установлена зимняя/летняя резина R16.</p><p>Возможна продажа в кредит, лизинг.</p><p>Ваш автомобиль в зачет.</p>`;

// export interface IOwner {
//   ownerName: string;
//   number: string;
//   notes: string;
// }

// export interface IField {
//   name: string;
//   title: string;
//   type: string;
// }

// export interface ICar {
//   id: number; // system
//   name: string; // system?
//   title: string;
//   status: string;
//   fields: IField[];
// }

export import ServerCar = serverCar;
export import ServerFile = serverFile;
export import ServerCarImage = serverCarImage;
export import CarQuestionnaireEnums = carQuestionnaire;
export import CarStatistic = carStatistic
import { StringHash } from './constants';

export type UICarShowingStatistic = Omit<CarStatistic.CarShowingResponse, 'content'>
  & { content: carStatistic.ShowingContent }
  & { car: ServerCar.Response };
export namespace UICarStatistic {
  export type Item = {
    type: StatisticType;
    date: Date;
    content: CarStatistic.CarShowingResponse["content"];
  }

  export enum StatisticType {
    Call,
    SuccessShowing,
    PlanShowing,
    Discount,
    None
  }
}

export function getCarStatus(car: ServerCar.Response): FieldNames.CarStatus {
  return FieldsUtils.getDropdownValue(car, FieldNames.Car.status) as FieldNames.CarStatus;
}

export type CarQuestionnaireHash = {
  [key in CarQuestionnaireEnums.CarQuestionnaire]: string;
};
export type GeneralConditionHash = {
  [key in CarQuestionnaireEnums.GeneralCondition]: string;
};
export type InspectionHash = {
  [key in CarQuestionnaireEnums.Inspection]: string;
};
export type ExteriorInspectionHash = {
  [key in CarQuestionnaireEnums.ExteriorInspection]: string;
};
export type CheckboxesHash = {
  [key in CarQuestionnaireEnums.Checkboxes]: string;
};

export interface ICarQuestionnaire {
  carQuestionnaire: CarQuestionnaireHash,
  generalCondition: GeneralConditionHash,
  inspection: InspectionHash,
  exteriorInspection: ExteriorInspectionHash,
  checkboxes: CheckboxesHash,
  description: string,
}

export class RealCarQuestionnaire implements ICarQuestionnaire {
  carQuestionnaire!: CarQuestionnaireHash;
  generalCondition!: GeneralConditionHash;
  inspection!: InspectionHash;
  exteriorInspection!: ExteriorInspectionHash;
  checkboxes!: CheckboxesHash;
  description!: string;

  constructor(carQuestionnaire: ICarQuestionnaire | null, car?: ServerCar.Response) {
    this.carQuestionnaire = CarQuestionnaireEnumsFactory.createCarQuestionnaire();

    if (carQuestionnaire?.carQuestionnaire) {
      for (const key in this.carQuestionnaire) {
        if (Object.prototype.hasOwnProperty.call(carQuestionnaire.carQuestionnaire, key)) {
          const element = carQuestionnaire.carQuestionnaire[key as CarQuestionnaireEnums.CarQuestionnaire];

          if (element != null) {
            this.carQuestionnaire[key as CarQuestionnaireEnums.CarQuestionnaire] = element
          }
        }
      }
    }
    this.generalCondition = CarQuestionnaireEnumsFactory.createGeneralCondition();

    if (carQuestionnaire?.generalCondition) {
      for (const key in this.generalCondition) {
        if (Object.prototype.hasOwnProperty.call(carQuestionnaire.generalCondition, key)) {
          const element = carQuestionnaire.generalCondition[key as CarQuestionnaireEnums.GeneralCondition];

          if (element != null) {
            this.generalCondition[key as CarQuestionnaireEnums.GeneralCondition] = element
          }
        }
      }
    }
    this.inspection = CarQuestionnaireEnumsFactory.createInspection(car);

    if (carQuestionnaire?.inspection) {
      for (const key in this.inspection) {
        if (Object.prototype.hasOwnProperty.call(carQuestionnaire.inspection, key)) {
          const element = carQuestionnaire.inspection[key as CarQuestionnaireEnums.Inspection];

          if (element != null) {
            this.inspection[key as CarQuestionnaireEnums.Inspection] = element
          }
        }
      }
    }
    this.exteriorInspection = CarQuestionnaireEnumsFactory.createExteriorInspection();

    if (carQuestionnaire?.exteriorInspection) {
      for (const key in this.exteriorInspection) {
        if (Object.prototype.hasOwnProperty.call(carQuestionnaire.exteriorInspection, key)) {
          const element = carQuestionnaire.exteriorInspection[key as CarQuestionnaireEnums.ExteriorInspection];

          if (element != null) {
            this.exteriorInspection[key as CarQuestionnaireEnums.ExteriorInspection] = element
          }
        }
      }
    }
    this.checkboxes = CarQuestionnaireEnumsFactory.createCheckboxes();

    if (carQuestionnaire?.checkboxes) {
      for (const key in this.checkboxes) {
        if (Object.prototype.hasOwnProperty.call(carQuestionnaire.checkboxes, key)) {
          const element = carQuestionnaire.checkboxes[key as CarQuestionnaireEnums.Checkboxes];

          if (element != null) {
            this.checkboxes[key as CarQuestionnaireEnums.Checkboxes] = element
          }
        }
      }
    }
    this.description = carQuestionnaire?.description || descriptionTemplate;
  }

  getValidation(): boolean {
    let valid = true;

    const checkValid = (object: StringHash) => Object.keys(object).forEach(c => {
      const exludeList: string[] = [
        CarQuestionnaireEnums.Inspection.stateInspection,
        CarQuestionnaireEnums.Inspection.termStateInspection,
        CarQuestionnaireEnums.Inspection.valueAddedTax,
        CarQuestionnaireEnums.Inspection.guarantee,
        CarQuestionnaireEnums.Inspection.termGuarantee,
        'bodyCondition'
      ]

      if (exludeList.includes(c)) {
        return;
      }

      if (
            object[c] === ''
        // || (c === 'fuelСonsumption' && object[c] === 'Город: ? Смешанный: ? Трасса: ? ')
        || exludeList.includes(c)
      ) {
        valid = false;
      }
    })

    checkValid(this.carQuestionnaire);
    // console.log(valid);
    checkValid(this.generalCondition);
    // console.log(valid);
    checkValid(this.inspection);
    // console.log(valid);
    checkValid(this.exteriorInspection);
    // console.log(valid);

    if (this.description === '' || this.description === descriptionTemplate) {
      // console.error('Описание не заполнено!')
      return false;
    }

    return valid;
  }
}

abstract class CarQuestionnaireEnumsFactory {
  static createCarQuestionnaire(): CarQuestionnaireHash {
    return {
      country: '',
      firstSaleCountry: '',
      ownerCounty: '',
      lastSaleWhere: '',
      lastSaleWhen: '',
      lastSaleMileage: '',
      bodyCondition: '',
      interiorCondition: '',
      oilLeak: '',
      oilLoss: '',
      suspensionCondition: '',
      repairCondition: '',
      activeErrors: '',
      inCarDoesntWork: '',
      whereWasServed: '',
      serviceHistory: '',
      serviceOrders: '',
      dateOrMileageOfLastMaintenance: '',
      repairOfLastMaintenance: '',
      carEquipment: '',
      officialEquipmentName: '',
      oilChangeDate: '',
      engineChainChangeWhen: '',
      WDMaintenanceDate: '',
      fuelСonsumption: 'Город: ? Смешанный: ? Трасса: ? ',
    }
  }

  static createGeneralCondition(): GeneralConditionHash {
    return {
      documentOwner: '',
      ownerGrade: '',
      saleReason: '',
      termSelling: '',
      harrySelling: '',
      callFrequency: '',
      costProposals: '',
      sumProposals: '',
      expectedSum: '',
      reasonExpectedSum: '',
      stateNumbers: '',
      leasing: '',
      readyToSale: '',
      testDriveAvailable: '',
      additionalContact: '',
    }
  }

  static createInspection(car?: ServerCar.Response): InspectionHash {
    return {
      date: '',
      name: car ? FieldsUtils.getFieldStringValue(car, FieldNames.CarOwner.name) || '' : '',
      number: car ? `${car.ownerNumber}` || '' : '',
      vin: '',
      brandModel: car ? `${FieldsUtils.getFieldValue(car, FieldNames.Car.mark)} ${FieldsUtils.getFieldValue(car, FieldNames.Car.model)}` : '',
      capacity:car ?  `${((FieldsUtils.getFieldNumberValue(car, FieldNames.Car.engineCapacity) || 0) * 1000) || ''}` : '',
      color: car ? FieldsUtils.getFieldStringValue(car, FieldNames.Car.color) || '' : '',
      power: '',
      seats: '',
      fuel: car ? FieldsUtils.getDropdownValue(car, FieldNames.Car.engine) || '' : '',
      year: car ? FieldsUtils.getFieldStringValue(car, FieldNames.Car.year) || '' : '',
      transmission: car ? FieldsUtils.getDropdownValue(car, FieldNames.Car.transmission) || '' : '',
      mileage: car ? FieldsUtils.getFieldStringValue(car, FieldNames.Car.mileage) || '' : '',
      guarantee: '',
      termGuarantee: '',
      driveType: car ? FieldsUtils.getDropdownValue(car, FieldNames.Car.driveType) || '' : '',
      stateInspection: '',
      termStateInspection: '',
      valueAddedTax: '',
      // bodyCondition: '',
      engineCondition: '',
      interiorCondition: '',
      exteriorCondition: '',
    }
  }

  static createExteriorInspection(): ExteriorInspectionHash {
    return {
      rightFrontFender: '0, X',
      rightFrontDoor: '0, X',
      rightRearDoor: '0, X',
      rightRearFender: '0, X',
      leftFrontFender: '0, X',
      leftFrontDoor: '0, X',
      leftRearDoor: '0, X',
      leftRearFender: '0, X',
      hood: '0, X',
      roof: '0, X',
      trunk: '0, X',
    }
  }

  static createCheckboxes(): CheckboxesHash {
    return {
      serviceHistory: '',
      guide: '',
      halogen: '',
      xenon: '',
      steediodes: '',
      LEDDRL: '',
      fogLights: '',
      heatedWindshield: '',
      heatedSteeringWheel: '',
      heatedFrontSeats: '',
      heatedRearSeats: '',
      lightSensor: '',
      rainSensor: '',
      tintedGlass: '',
      luke: '',
      panoramicView: '',
      airConditioning: '',
      climateControl: '',
      monochromeDisplay: '',
      colorDisplay: '',
      rearSeatScreens: '',
      textile: '',
      combined: '',
      leather: '',
      secondNonHave: '',
      secondTires: '',
      secondTiresWithDisks: '',
      secondTiresR: '',
      summerTires: '',
      winterTires: '',
      winterTiresR: '',
      multifunction: '',
      frontParkingSensors: '',
      rearParkingSensors: '',
      blindSpotIndicator: '',
      frontViewCamera: '',
      rearViewCamera: '',
      camera360: '',
      headUpDisplay: '',
      laneDepartureIndicator: '',
      carParkingSystem: '',
      cruiseControl: '',
      adaptiveCruiseControl: '',
      automaticHighLowBeam: '',
      electricallyAdjustableSeats: '',
      seatMemory: '',
      seatVentilation: '',
      powerMirrors: '',
      electroFoldingMirrors: '',
      trunkElectricDrive: '',
      doorPresses: '',
      leatherSteeringWheel: '',
      signaling: '',
      airSuspension: '',
      premiumAcoustics: '',
      premiumAcousticsNames: '',
      towbar: '',
      startStopSystem: '',
      engineStartButton: '',
      keylessAccess: '',
      roofRails: '',
      trafficSignRecognition: '',
      numberOfKeys: '',
    }
  }
}
