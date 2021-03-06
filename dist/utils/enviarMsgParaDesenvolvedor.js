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
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
function enviarMsgParaDesenvolvedor(sock, message) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield sock.sendMessage(`55${process.env.TELEFONE_DESENVOLVEDOR}@s.whatsapp.net`, {
                text: message,
            });
        }
        catch (error) {
            console.error('Error when sending text message: ', error); // return object error
        }
    });
}
exports.default = enviarMsgParaDesenvolvedor;
