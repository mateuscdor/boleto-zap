"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = __importDefault(require("../services/api"));
const dates_1 = require("./dates");
function getBoletos(diasFaltandoParaVencer, pagina) {
    return __awaiter(this, void 0, void 0, function* () {
        const dataVencimento = (0, dates_1.currentDatePlus)(diasFaltandoParaVencer);
        const response = yield api_1.default.get(`/boletos?situacaoBoleto=10&dtTipo=dtVenc&dtIni=${dataVencimento}&dtFim=${dataVencimento}&page=${pagina}&orderBy=dtVenc,desc`);
        const boletos = response.data;
        return Object.assign(Object.assign({}, boletos), { diasParaVencer: diasFaltandoParaVencer });
    });
}
exports.default = getBoletos;
