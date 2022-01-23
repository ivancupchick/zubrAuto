"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CarFormEnums = exports.FieldNames = void 0;
var FieldNames;
(function (FieldNames) {
    let Client;
    (function (Client) {
        Client["date"] = "date";
        Client["source"] = "source";
        Client["name"] = "name";
        Client["number"] = "number";
        Client["email"] = "email";
        Client["paymentType"] = "payment-type";
        Client["tradeInAuto"] = "trade-in-auto";
        Client["dealStatus"] = "deal-status";
        Client["comment"] = "comment";
    })(Client = FieldNames.Client || (FieldNames.Client = {}));
    let Car;
    (function (Car) {
        Car["status"] = "status";
        Car["engine"] = "engine";
        Car["engineCapacity"] = "engine-capacity";
        Car["mileage"] = "mileage";
        Car["year"] = "year";
        Car["mark"] = "mark";
        Car["model"] = "model";
        Car["transmission"] = "transmission";
        Car["color"] = "color";
        Car["driveType"] = "drive-type";
        Car["linkToAd"] = "link-to-ad";
        Car["carOwnerPrice"] = "car-owner-price";
        Car["commission"] = "commission";
        Car["comment"] = "comment";
        Car["dateOfLastStatusChange"] = "date-of-last-status-change";
        Car["dateOfLastCustomerCall"] = "date-of-last-customer-call";
        Car["worksheet"] = "worksheet";
        Car["bargain"] = "bargain";
        Car["adPrice"] = "ad-price";
        Car["shootingDate"] = "shooting-date";
        Car["shootingTime"] = "shooting-time";
        Car["ourLinks"] = "our-links";
        Car["contactCenterSpecialistId"] = "contact-center-specialist-id";
        Car["carShootingSpecialistId"] = "car-shooting-specialist-id";
        Car["source"] = "source";
        Car["statistic"] = "statistic";
        Car["bodyType"] = "body-type";
        Car["contactCenterSpecialist"] = "contact-center-specialist";
        Car["mainPhotoId"] = "main-photo-id";
    })(Car = FieldNames.Car || (FieldNames.Car = {}));
    let CarStatus;
    (function (CarStatus) {
        CarStatus["contactCenter_InProgress"] = "[\u041E\u041A\u0426]\u0412 \u0440\u0430\u0431\u043E\u0442\u0435";
        CarStatus["contactCenter_NoAnswer"] = "[\u041E\u041A\u0426]\u041D\u0435\u0434\u043E\u0437\u0432\u043E\u043D";
        CarStatus["contactCenter_MakingDecision"] = "[\u041E\u041A\u0426]\u041F\u0440\u0438\u043D\u0438\u043C\u0430\u0435\u0442 \u0440\u0435\u0448\u0435\u043D\u0438\u0435";
        CarStatus["contactCenter_WaitingShooting"] = "[\u041E\u041A\u0426]\u041E\u0436\u0438\u0434\u0430\u043D\u0438\u0435 \u0441\u044A\u0435\u043C\u043A\u0438";
        CarStatus["contactCenter_Deny"] = "[\u041E\u041A\u0426]\u041E\u0442\u043A\u0430\u0437";
        CarStatus["contactCenter_Refund"] = "[\u041E\u041A\u0426]\u0412\u043E\u0437\u0432\u0440\u0430\u0442 \u043E\u0442 \u041E\u0421\u0410";
        CarStatus["carShooting_InProgres"] = "[\u041E\u0421\u0410]\u0432 \u0440\u0430\u0431\u043E\u0442\u0435";
        CarStatus["carShooting_Refund"] = "[\u041E\u0421\u0410]\u0412\u043E\u0437\u0432\u0440\u0430\u0442 \u043E\u0442 \u041E\u0420\u041A";
        CarStatus["carShooting_Ready"] = "[\u041E\u0421\u0410]\u0433\u043E\u0442\u043E\u0432";
        CarStatus["customerService_InProgress"] = "[\u041E\u0420\u041A]\u0432 \u0440\u0430\u0431\u043E\u0442\u0435";
        CarStatus["customerService_OnPause"] = "[\u041E\u0420\u041A]\u043D\u0430 \u043F\u0430\u0443\u0437\u0435";
        CarStatus["customerService_OnDelete"] = "[\u041E\u0420\u041A]\u043D\u0430 \u0443\u0434\u0430\u043B\u0435\u043D\u0438\u0435";
        CarStatus["customerService_Sold"] = "[\u041E\u0420\u041A]\u043F\u0440\u043E\u0434\u0430\u043D\u0430";
        CarStatus["carSales_Deposit"] = "[\u041E\u041F\u0410]\u0414\u0430\u043D \u0437\u0430\u0434\u0430\u0442\u043E\u043A";
        CarStatus["admin_Deleted"] = "[\u0410\u0434\u043C\u0438\u043D]\u0423\u0434\u0430\u043B\u0435\u043D\u0430";
    })(CarStatus = FieldNames.CarStatus || (FieldNames.CarStatus = {}));
    let DealStatus;
    (function (DealStatus) {
        DealStatus["InProgress"] = "\u0412 \u0440\u0430\u0431\u043E\u0442\u0435";
        DealStatus["Deny"] = "\u041E\u0442\u043A\u0430\u0437";
        DealStatus["Sold"] = "\u041F\u0440\u043E\u0434\u0430\u043D\u043E";
        DealStatus["OnDeposit"] = "\u0414\u0430\u043B \u0437\u0430\u0434\u0430\u0442\u043E\u043A";
    })(DealStatus = FieldNames.DealStatus || (FieldNames.DealStatus = {}));
    let CarOwner;
    (function (CarOwner) {
        CarOwner["name"] = "name";
        CarOwner["ownerNumber"] = "ownerNumber";
    })(CarOwner = FieldNames.CarOwner || (FieldNames.CarOwner = {}));
    let User;
    (function (User) {
        User["name"] = "name";
    })(User = FieldNames.User || (FieldNames.User = {}));
})(FieldNames = exports.FieldNames || (exports.FieldNames = {}));
var CarFormEnums;
(function (CarFormEnums) {
    let CarQuestionnaire;
    (function (CarQuestionnaire) {
        CarQuestionnaire["country"] = "country";
        CarQuestionnaire["firstSaleCountry"] = "firstSaleCountry";
        CarQuestionnaire["ownerCounty"] = "ownerCounty";
        CarQuestionnaire["lastSaleWhere"] = "lastSaleWhere";
        CarQuestionnaire["lastSaleWhen"] = "lastSaleWhen";
        CarQuestionnaire["lastSaleMileage"] = "lastSaleMileage";
        CarQuestionnaire["bodyCondition"] = "bodyCondition";
        CarQuestionnaire["interiorCondition"] = "interiorCondition";
        CarQuestionnaire["oilLeak"] = "oilLeak";
        CarQuestionnaire["oilLoss"] = "oilLoss";
        CarQuestionnaire["suspensionCondition"] = "suspensionCondition";
        CarQuestionnaire["repairCondition"] = "repairCondition";
        CarQuestionnaire["activeErrors"] = "activeErrors";
        CarQuestionnaire["inCarDoesntWork"] = "inCarDoesntWork";
        CarQuestionnaire["whereWasServed"] = "whereWasServed";
        CarQuestionnaire["serviceHistory"] = "serviceHistory";
        CarQuestionnaire["serviceOrders"] = "serviceOrders";
        CarQuestionnaire["dateOrMileageOfLastMaintenance"] = "dateOrMileageOfLastMaintenance";
        CarQuestionnaire["repairOfLastMaintenance"] = "repairOfLastMaintenance";
        CarQuestionnaire["carEquipment"] = "carEquipment";
        CarQuestionnaire["officialEquipmentName"] = "officialEquipmentName";
        CarQuestionnaire["oilChangeDate"] = "oilChangeDate";
        CarQuestionnaire["engineChainChangeWhen"] = "engineChainChangeWhen";
        CarQuestionnaire["WDMaintenanceDate"] = "WDMaintenanceDate";
        CarQuestionnaire["fuel\u0421onsumption"] = "fuel\u0421onsumption";
    })(CarQuestionnaire = CarFormEnums.CarQuestionnaire || (CarFormEnums.CarQuestionnaire = {}));
    let GeneralCondition;
    (function (GeneralCondition) {
        GeneralCondition["documentOwner"] = "documentOwner";
        GeneralCondition["ownerGrade"] = "ownerGrade";
        GeneralCondition["saleReason"] = "saleReason";
        GeneralCondition["termSelling"] = "termSelling";
        GeneralCondition["harrySelling"] = "harrySelling";
        GeneralCondition["callFrequency"] = "callFrequency";
        GeneralCondition["costProposals"] = "costProposals";
        GeneralCondition["sumProposals"] = "sumProposals";
        GeneralCondition["expectedSum"] = "expectedSum";
        GeneralCondition["reasonExpectedSum"] = "reasonExpectedSum";
        GeneralCondition["stateNumbers"] = "stateNumbers";
        GeneralCondition["leasing"] = "leasing";
        GeneralCondition["readyToSale"] = "readyToSale";
        GeneralCondition["testDriveAvailable"] = "testDriveAvailable";
        GeneralCondition["additionalContact"] = "additionalContact";
    })(GeneralCondition = CarFormEnums.GeneralCondition || (CarFormEnums.GeneralCondition = {}));
    let Inspection;
    (function (Inspection) {
        Inspection["date"] = "date";
        Inspection["name"] = "name";
        Inspection["number"] = "number";
        Inspection["vin"] = "vin";
        Inspection["brandModel"] = "brandModel";
        Inspection["capacity"] = "capacity";
        Inspection["color"] = "color";
        Inspection["power"] = "power";
        Inspection["seats"] = "seats";
        Inspection["fuel"] = "fuel";
        Inspection["year"] = "year";
        Inspection["transmission"] = "transmission";
        Inspection["mileage"] = "mileage";
        Inspection["guarantee"] = "guarantee";
        Inspection["termGuarantee"] = "termGuarantee";
        Inspection["driveType"] = "driveType";
        Inspection["stateInspection"] = "stateInspection";
        Inspection["termStateInspection"] = "termStateInspection";
        Inspection["valueAddedTax"] = "valueAddedTax";
        // bodyCondition = 'bodyCondition',
        Inspection["engineCondition"] = "engineCondition";
        Inspection["interiorCondition"] = "interiorCondition";
        Inspection["exteriorCondition"] = "exteriorCondition";
    })(Inspection = CarFormEnums.Inspection || (CarFormEnums.Inspection = {}));
    let ExteriorInspection;
    (function (ExteriorInspection) {
        ExteriorInspection["rightFrontFender"] = "rightFrontFender";
        ExteriorInspection["rightFrontDoor"] = "rightFrontDoor";
        ExteriorInspection["rightRearDoor"] = "rightRearDoor";
        ExteriorInspection["rightRearFender"] = "rightRearFender";
        ExteriorInspection["leftFrontFender"] = "leftFrontFender";
        ExteriorInspection["leftFrontDoor"] = "leftFrontDoor";
        ExteriorInspection["leftRearDoor"] = "leftRearDoor";
        ExteriorInspection["leftRearFender"] = "leftRearFender";
        ExteriorInspection["hood"] = "hood";
        ExteriorInspection["roof"] = "roof";
        ExteriorInspection["trunk"] = "trunk";
    })(ExteriorInspection = CarFormEnums.ExteriorInspection || (CarFormEnums.ExteriorInspection = {}));
    let Checkboxes;
    (function (Checkboxes) {
        Checkboxes["serviceHistory"] = "serviceHistory";
        Checkboxes["guide"] = "guide";
        Checkboxes["halogen"] = "halogen";
        Checkboxes["xenon"] = "xenon";
        Checkboxes["steediodes"] = "steediodes";
        Checkboxes["LEDDRL"] = "LEDDRL";
        Checkboxes["fogLights"] = "fogLights";
        Checkboxes["heatedWindshield"] = "heatedWindshield";
        Checkboxes["heatedSteeringWheel"] = "heatedSteeringWheel";
        Checkboxes["heatedFrontSeats"] = "heatedFrontSeats";
        Checkboxes["heatedRearSeats"] = "heatedRearSeats";
        Checkboxes["lightSensor"] = "lightSensor";
        Checkboxes["rainSensor"] = "rainSensor";
        Checkboxes["tintedGlass"] = "tintedGlass";
        Checkboxes["luke"] = "luke";
        Checkboxes["panoramicView"] = "panoramicView";
        Checkboxes["airConditioning"] = "airConditioning";
        Checkboxes["climateControl"] = "climateControl";
        Checkboxes["monochromeDisplay"] = "monochromeDisplay";
        Checkboxes["colorDisplay"] = "colorDisplay";
        Checkboxes["rearSeatScreens"] = "rearSeatScreens";
        Checkboxes["textile"] = "textile";
        Checkboxes["combined"] = "combined";
        Checkboxes["leather"] = "leather";
        Checkboxes["multifunction"] = "multifunction";
        Checkboxes["frontParkingSensors"] = "frontParkingSensors";
        Checkboxes["rearParkingSensors"] = "rearParkingSensors";
        Checkboxes["blindSpotIndicator"] = "blindSpotIndicator";
        Checkboxes["frontViewCamera"] = "frontViewCamera";
        Checkboxes["rearViewCamera"] = "rearViewCamera";
        Checkboxes["camera360"] = "camera360";
        Checkboxes["headUpDisplay"] = "headUpDisplay";
        Checkboxes["laneDepartureIndicator"] = "laneDepartureIndicator";
        Checkboxes["carParkingSystem"] = "carParkingSystem";
        Checkboxes["cruiseControl"] = "cruiseControl";
        Checkboxes["adaptiveCruiseControl"] = "adaptiveCruiseControl";
        Checkboxes["automaticHighLowBeam"] = "automaticHighLowBeam";
        Checkboxes["electricallyAdjustableSeats"] = "electricallyAdjustableSeats";
        Checkboxes["seatMemory"] = "seatMemory";
        Checkboxes["seatVentilation"] = "seatVentilation";
        Checkboxes["powerMirrors"] = "powerMirrors";
        Checkboxes["electroFoldingMirrors"] = "electroFoldingMirrors";
        Checkboxes["trunkElectricDrive"] = "trunkElectricDrive";
        Checkboxes["doorPresses"] = "doorPresses";
        Checkboxes["leatherSteeringWheel"] = "leatherSteeringWheel";
        Checkboxes["signaling"] = "signaling";
        Checkboxes["airSuspension"] = "airSuspension";
        Checkboxes["premiumAcoustics"] = "premiumAcoustics";
        Checkboxes["towbar"] = "towbar";
        Checkboxes["startStopSystem"] = "startStopSystem";
        Checkboxes["engineStartButton"] = "engineStartButton";
        Checkboxes["keylessAccess"] = "keylessAccess";
        Checkboxes["roofRails"] = "roofRails";
        Checkboxes["trafficSignRecognition"] = "trafficSignRecognition";
        Checkboxes["numberOfKeys"] = "numberOfKeys";
    })(Checkboxes = CarFormEnums.Checkboxes || (CarFormEnums.Checkboxes = {}));
})(CarFormEnums = exports.CarFormEnums || (exports.CarFormEnums = {}));
//# sourceMappingURL=FieldNames.js.map