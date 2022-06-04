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
const api_1 = require("./services/api");
const whatsappConnection_1 = __importDefault(require("./services/whatsappConnection"));
const dates_1 = require("./utils/dates");
const enviarBoletosParaClientes_1 = __importDefault(require("./utils/enviarBoletosParaClientes"));
const enviarMsgParaDesenvolvedor_1 = __importDefault(require("./utils/enviarMsgParaDesenvolvedor"));
const getBoletos_1 = __importDefault(require("./utils/getBoletos"));
function start(sock) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Iniciando operações.');
        yield (0, enviarMsgParaDesenvolvedor_1.default)(sock, 'Iniciando operações.');
        console.log('Set Authorization header with access_token');
        const accessToken = yield (0, api_1.getAccessToken)();
        (0, api_1.setApiAuthHeader)(accessToken);
        console.log('Buscar boletos que vencerão amanhã e enviar para cliente');
        const boletosQueVenceraoAmanha = yield (0, getBoletos_1.default)(1, 1);
        yield (0, enviarBoletosParaClientes_1.default)(sock, boletosQueVenceraoAmanha);
        console.log('Buscar boletos que vencerão daqui 7 dias e enviar para cliente');
        const boletosQueVenceraoDaqui7Dias = yield (0, getBoletos_1.default)(7, 1);
        yield (0, enviarBoletosParaClientes_1.default)(sock, boletosQueVenceraoDaqui7Dias);
        yield (0, enviarMsgParaDesenvolvedor_1.default)(sock, 'As operações de hoje foram concluídas.');
        console.log('As operações de hoje foram concluídas.');
        console.log('==============================================');
        const tomorrow5AM = (0, dates_1.currentDate)()
            .plus({ days: 1 })
            .set({ hour: 5, minute: 0 });
        const millisTill5AM = tomorrow5AM
            .diffNow('milliseconds')
            .toObject().milliseconds;
        // Repeat the function start every day at 5AM GMT -03:00 (Brasilia Standard Time)
        setTimeout(() => __awaiter(this, void 0, void 0, function* () {
            yield start(sock);
        }), millisTill5AM);
    });
}
// Create whatsappConnection and run program
function createSocketAndRunProgram() {
    return __awaiter(this, void 0, void 0, function* () {
        const sock = yield (0, whatsappConnection_1.default)(); // Use `await` here, `.then` will not work
        start(sock);
    });
}
createSocketAndRunProgram();
