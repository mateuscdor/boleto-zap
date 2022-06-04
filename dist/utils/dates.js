"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.currentDatePlus = exports.currentDate = void 0;
const luxon_1 = require("luxon");
// GMT -03:00 (Brasilia Standard Time)
function currentDate() {
    return luxon_1.DateTime.now().setZone('America/Sao_Paulo');
}
exports.currentDate = currentDate;
function currentDatePlus(days) {
    return currentDate().plus({ days }).toISODate();
}
exports.currentDatePlus = currentDatePlus;
