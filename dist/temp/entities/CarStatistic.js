"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CarStatistic = void 0;
var CarStatistic;
(function (CarStatistic) {
    let Type;
    (function (Type) {
        Type[Type["call"] = 0] = "call";
        Type[Type["showing"] = 1] = "showing";
        Type[Type["customerCall"] = 2] = "customerCall";
        Type[Type["customerDiscount"] = 3] = "customerDiscount";
    })(Type = CarStatistic.Type || (CarStatistic.Type = {}));
    let ShowingStatus;
    (function (ShowingStatus) {
        ShowingStatus["cancel"] = "\u041E\u0442\u043C\u0435\u043D\u0430";
        ShowingStatus["plan"] = "\u0417\u0430\u043F\u043B\u0430\u043D\u0438\u0440\u043E\u0432\u0430\u043D";
        ShowingStatus["success"] = "\u041F\u0440\u043E\u0438\u0437\u0432\u0435\u0434\u0435\u043D";
    })(ShowingStatus = CarStatistic.ShowingStatus || (CarStatistic.ShowingStatus = {}));
})(CarStatistic || (exports.CarStatistic = CarStatistic = {}));
//# sourceMappingURL=CarStatistic.js.map