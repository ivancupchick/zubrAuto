import { ServerFile } from '../../../../src/entities/File'
import { ServerCar } from '../../../../src/entities/Car'
import { ServerCarImage as serverCarImage } from '../../../../src/entities/Car'
import { CarFormEnums as carForm } from '../../../../src/entities/FieldNames';
import { CarStatistic as carStatistic } from '../../../../src/entities/CarStatistic';
import { FieldsUtils } from './field';
import { FieldNames } from './FieldNames';



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

export import ServerCar = ServerCar;
export import CarImage = ServerFile;
export import ServerCarImage = serverCarImage;
export import CarFormEnums = carForm;
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
  carQuestionnaire: CarQuestionnaireHash,
  generalCondition: GeneralConditionHash,
  inspection: InspectionHash,
  exteriorInspection: ExteriorInspectionHash,
  checkboxes: CheckboxesHash,
}

export class RealCarForm implements ICarForm {
  carQuestionnaire!: CarQuestionnaireHash;
  generalCondition!: GeneralConditionHash;
  inspection!: InspectionHash;
  exteriorInspection!: ExteriorInspectionHash;
  checkboxes!: CheckboxesHash;

  constructor(carForm: ICarForm | null, car?: ServerCar.Response) {
    this.carQuestionnaire = carForm?.carQuestionnaire || CarFormEnumsFactory.createCarQuestionnaire();
    this.generalCondition = carForm?.generalCondition || CarFormEnumsFactory.createGeneralCondition();
    this.inspection = carForm?.inspection || CarFormEnumsFactory.createInspection(car);
    this.exteriorInspection = carForm?.exteriorInspection || CarFormEnumsFactory.createExteriorInspection();
    this.checkboxes = carForm?.checkboxes || CarFormEnumsFactory.createCheckboxes();
  }

  getValidation(): boolean {
    let valid = true;

    const checkValid = (object: StringHash) => Object.keys(object).forEach(c => {
      const exludeList: string[] = [
        CarFormEnums.Inspection.stateInspection,
        CarFormEnums.Inspection.valueAddedTax,
        CarFormEnums.Inspection.guarantee,
        CarFormEnums.Inspection.guarantee,
        'bodyCondition'
      ]

      if (exludeList.includes(c)) {
        return;
      }

      if (
            object[c] === ''
        || (c === 'fuelСonsumption' && object[c] === 'Город: ? Смешанный: ? Трасса: ? ')
        || exludeList.includes(c)
      ) {
        valid = false;
      }
    })

    checkValid(this.carQuestionnaire);
    checkValid(this.generalCondition);
    checkValid(this.inspection);
    checkValid(this.exteriorInspection);

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
