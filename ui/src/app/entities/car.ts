import { ServerFile as serverFile } from '../../../../src/temp/entities/File';
import { ServerCar as serverCar } from '../../../../src/temp/entities/Car';
import { ServerCarImage as serverCarImage } from '../../../../src/temp/entities/Car';
import { CarFormEnums as carForm } from '../../../../src/temp/entities/FieldNames';
import { CarStatistic as carStatistic } from '../../../../src/temp/entities/CarStatistic';
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
export import CarFormEnums = carForm;
export import CarStatistic = carStatistic;
import { StringHash } from './constants';

export type UICarShowingStatistic = Omit<
  CarStatistic.CarShowingResponse,
  'content'
> & { content: carStatistic.ShowingContent } & { car: ServerCar.Response };
export namespace UICarStatistic {
  export type Item = {
    type: StatisticType;
    date: Date;
    content: CarStatistic.CarShowingResponse['content'];
  };

  export enum StatisticType {
    Call,
    SuccessShowing,
    PlanShowing,
    Discount,
    None,
  }
}

export function getCarStatus(car: ServerCar.Response): FieldNames.CarStatus {
  return FieldsUtils.getDropdownValue(
    car,
    FieldNames.Car.status,
  ) as FieldNames.CarStatus;
}

export type CarQuestionnaireHash = {
  [key in CarFormEnums.CarQuestionnaire]: string;
};
export type GeneralConditionHash = {
  [key in CarFormEnums.GeneralCondition]: string;
};
export type InspectionHash = {
  [key in CarFormEnums.Inspection]: string;
};
export type ExteriorInspectionHash = {
  [key in CarFormEnums.ExteriorInspection]: string;
};
export type CheckboxesHash = {
  [key in CarFormEnums.Checkboxes]: string;
};

export interface ICarForm {
  carQuestionnaire: CarQuestionnaireHash;
  generalCondition: GeneralConditionHash;
  inspection: InspectionHash;
  exteriorInspection: ExteriorInspectionHash;
  checkboxes: CheckboxesHash;
  description: string;
}

export class RealCarForm implements ICarForm {
  carQuestionnaire!: CarQuestionnaireHash;
  generalCondition!: GeneralConditionHash;
  inspection!: InspectionHash;
  exteriorInspection!: ExteriorInspectionHash;
  checkboxes!: CheckboxesHash;
  description!: string;

  constructor(carForm: ICarForm | null, car?: ServerCar.Response) {
    this.carQuestionnaire = CarFormEnumsFactory.createCarQuestionnaire();

    if (carForm?.carQuestionnaire) {
      for (const key in this.carQuestionnaire) {
        if (
          Object.prototype.hasOwnProperty.call(carForm.carQuestionnaire, key)
        ) {
          const element =
            carForm.carQuestionnaire[key as CarFormEnums.CarQuestionnaire];

          if (element != null) {
            this.carQuestionnaire[key as CarFormEnums.CarQuestionnaire] =
              element;
          }
        }
      }
    }
    this.generalCondition = CarFormEnumsFactory.createGeneralCondition();

    if (carForm?.generalCondition) {
      for (const key in this.generalCondition) {
        if (
          Object.prototype.hasOwnProperty.call(carForm.generalCondition, key)
        ) {
          const element =
            carForm.generalCondition[key as CarFormEnums.GeneralCondition];

          if (element != null) {
            this.generalCondition[key as CarFormEnums.GeneralCondition] =
              element;
          }
        }
      }
    }
    this.inspection = CarFormEnumsFactory.createInspection(car);

    if (carForm?.inspection) {
      for (const key in this.inspection) {
        if (Object.prototype.hasOwnProperty.call(carForm.inspection, key)) {
          const element = carForm.inspection[key as CarFormEnums.Inspection];

          if (element != null) {
            this.inspection[key as CarFormEnums.Inspection] = element;
          }
        }
      }
    }
    this.exteriorInspection = CarFormEnumsFactory.createExteriorInspection();

    if (carForm?.exteriorInspection) {
      for (const key in this.exteriorInspection) {
        if (
          Object.prototype.hasOwnProperty.call(carForm.exteriorInspection, key)
        ) {
          const element =
            carForm.exteriorInspection[key as CarFormEnums.ExteriorInspection];

          if (element != null) {
            this.exteriorInspection[key as CarFormEnums.ExteriorInspection] =
              element;
          }
        }
      }
    }
    this.checkboxes = CarFormEnumsFactory.createCheckboxes();

    if (carForm?.checkboxes) {
      for (const key in this.checkboxes) {
        if (Object.prototype.hasOwnProperty.call(carForm.checkboxes, key)) {
          const element = carForm.checkboxes[key as CarFormEnums.Checkboxes];

          if (element != null) {
            this.checkboxes[key as CarFormEnums.Checkboxes] = element;
          }
        }
      }
    }
    this.description = carForm?.description || descriptionTemplate;
  }

  getValidation(): boolean {
    let valid = true;

    const checkValid = (object: StringHash) =>
      Object.keys(object).forEach((c) => {
        const exludeList: string[] = [
          CarFormEnums.Inspection.stateInspection,
          CarFormEnums.Inspection.termStateInspection,
          CarFormEnums.Inspection.valueAddedTax,
          CarFormEnums.Inspection.guarantee,
          CarFormEnums.Inspection.termGuarantee,
          'bodyCondition',
        ];

        if (exludeList.includes(c)) {
          return;
        }

        if (
          object[c] === '' ||
          // || (c === 'fuelСonsumption' && object[c] === 'Город: ? Смешанный: ? Трасса: ? ')
          exludeList.includes(c)
        ) {
          valid = false;
        }
      });

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

abstract class CarFormEnumsFactory {
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
    };
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
    };
  }

  static createInspection(car?: ServerCar.Response): InspectionHash {
    return {
      date: '',
      name: car
        ? FieldsUtils.getFieldStringValue(car, FieldNames.CarOwner.name) || ''
        : '',
      number: car ? `${car.ownerNumber}` || '' : '',
      vin: '',
      brandModel: car
        ? `${FieldsUtils.getFieldValue(car, FieldNames.Car.mark)} ${FieldsUtils.getFieldValue(car, FieldNames.Car.model)}`
        : '',
      capacity: car
        ? `${(FieldsUtils.getFieldNumberValue(car, FieldNames.Car.engineCapacity) || 0) * 1000 || ''}`
        : '',
      color: car
        ? FieldsUtils.getFieldStringValue(car, FieldNames.Car.color) || ''
        : '',
      power: '',
      seats: '',
      fuel: car
        ? FieldsUtils.getDropdownValue(car, FieldNames.Car.engine) || ''
        : '',
      year: car
        ? FieldsUtils.getFieldStringValue(car, FieldNames.Car.year) || ''
        : '',
      transmission: car
        ? FieldsUtils.getDropdownValue(car, FieldNames.Car.transmission) || ''
        : '',
      mileage: car
        ? FieldsUtils.getFieldStringValue(car, FieldNames.Car.mileage) || ''
        : '',
      guarantee: '',
      termGuarantee: '',
      driveType: car
        ? FieldsUtils.getDropdownValue(car, FieldNames.Car.driveType) || ''
        : '',
      stateInspection: '',
      termStateInspection: '',
      valueAddedTax: '',
      // bodyCondition: '',
      engineCondition: '',
      interiorCondition: '',
      exteriorCondition: '',
    };
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
    };
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
    };
  }
}
