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

export type UICarStatistic = CarStatistic.CarShowingResponse & { car: ServerCar.Response };

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

  constructor(carForm: ICarForm | null) {
    this.carQuestionnaire = carForm?.carQuestionnaire || CarFormEnumsFactory.createCarQuestionnaire();
    this.generalCondition = carForm?.generalCondition || CarFormEnumsFactory.createGeneralCondition();
    this.inspection = carForm?.inspection || CarFormEnumsFactory.createInspection();
    this.exteriorInspection = carForm?.exteriorInspection || CarFormEnumsFactory.createExteriorInspection();
    this.checkboxes = carForm?.checkboxes || CarFormEnumsFactory.createCheckboxes();
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

  static createInspection(): InspectionHash {
    return {
      date: '',
      name: '',
      number: '',
      vin: '',
      brandModel: '',
      capacity: '',
      color: '',
      power: '',
      seats: '',
      fuel: '',
      year: '',
      transmission: '',
      mileage: '',
      guarantee: '',
      termGuarantee: '',
      driveType: '',
      stateInspection: '',
      termStateInspection: '',
      valueAddedTax: '',
      bodyCondition: '',
      engineCondition: '',
      interiorCondition: '',
      exteriorCondition: '',
    }
  }

  static createExteriorInspection(): ExteriorInspectionHash {
    return {
      rightFrontFender: '',
      rightFrontDoor: '',
      rightRearDoor: '',
      rightRearFender: '',
      leftFrontFender: '',
      leftFrontDoor: '',
      leftRearDoor: '',
      leftRearFender: '',
      hood: '',
      roof: '',
      trunk: '',
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
