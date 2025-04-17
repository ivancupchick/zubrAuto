"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Webhook = void 0;
var Webhook;
(function (Webhook) {
    let NotificationType;
    (function (NotificationType) {
        NotificationType["Start"] = "START";
        NotificationType["State"] = "STATE";
        NotificationType["Finish"] = "FINISH";
    })(NotificationType = Webhook.NotificationType || (Webhook.NotificationType = {}));
    let CallType;
    (function (CallType) {
        CallType["Inbound"] = "INBOUND";
        CallType["Outbound"] = "OUTBOUND";
        CallType["Internal"] = "INTERNAL";
    })(CallType = Webhook.CallType || (Webhook.CallType = {}));
    let CallState;
    (function (CallState) {
        CallState["Up"] = "UP";
        CallState["Down"] = "DOWN";
    })(CallState = Webhook.CallState || (Webhook.CallState = {}));
    let DialTyoe;
    (function (DialTyoe) {
        DialTyoe["Single"] = "SINGLE";
        DialTyoe["Same_Time"] = "SAME_TIME";
        DialTyoe["Sequential"] = "SEQUENTIAL";
    })(DialTyoe = Webhook.DialTyoe || (Webhook.DialTyoe = {}));
    let CallFinishedStatus;
    (function (CallFinishedStatus) {
        CallFinishedStatus["Answered"] = "ANSWERED";
        CallFinishedStatus["Not_Answered"] = "NOT_ANSWERED";
        CallFinishedStatus["Cancelled"] = "CANCELLED";
        CallFinishedStatus["Busy"] = "BUSY";
        CallFinishedStatus["Denied"] = "DENIED";
    })(CallFinishedStatus = Webhook.CallFinishedStatus || (Webhook.CallFinishedStatus = {}));
})(Webhook || (exports.Webhook = Webhook = {}));
//# sourceMappingURL=webhook.js.map