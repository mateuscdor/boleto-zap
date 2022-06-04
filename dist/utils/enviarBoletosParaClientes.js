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
const libphonenumber_js_1 = __importDefault(require("libphonenumber-js"));
const api_1 = __importDefault(require("../services/api"));
const enviarMsgParaDesenvolvedor_1 = __importDefault(require("./enviarMsgParaDesenvolvedor"));
const getBoletos_1 = __importDefault(require("./getBoletos"));
function enviarBoletosParaClientes(sock, dadosDosBoletos) {
    return __awaiter(this, void 0, void 0, function* () {
        const { diasParaVencer } = dadosDosBoletos;
        let mensagemDataVenc;
        if (diasParaVencer === 1) {
            mensagemDataVenc = 'amanhã';
        }
        else {
            mensagemDataVenc = `daqui a ${diasParaVencer} dias`;
        }
        for (const element of dadosDosBoletos.data) {
            const dadosBoleto = yield api_1.default.get(`/boletos/${element.codigo}`);
            const linkBoleto = dadosBoleto.data.link;
            const codCliente = dadosBoleto.data.codContato;
            const dadosCliente = yield api_1.default.get(`/contatos/${codCliente}`);
            const nomeCliente = dadosCliente.data.nome;
            const telefoneCliente = dadosCliente.data.fones[0];
            const telefoneClienteParsedProperties = (0, libphonenumber_js_1.default)(telefoneCliente, 'BR');
            if (telefoneClienteParsedProperties) {
                // Remove o caractere '+' do inicio do numero
                const telefoneClienteValidado = telefoneClienteParsedProperties.number.replace('+', '');
                // Enviar mensagem
                try {
                    yield sock.sendMessage(`${telefoneClienteValidado}@s.whatsapp.net`, {
                        text: `Olá, ${nomeCliente}. Seu boleto vencerá ${mensagemDataVenc}.`,
                    });
                }
                catch (error) {
                    console.error('Error when text message: ', error); // return object error
                    yield (0, enviarMsgParaDesenvolvedor_1.default)(sock, error);
                }
                // Enviar boleto
                try {
                    yield sock.sendMessage(`${telefoneClienteValidado}@s.whatsapp.net`, {
                        mimetype: 'application/pdf',
                        document: { url: linkBoleto },
                        fileName: 'boleto-cliente',
                    });
                }
                catch (error) {
                    console.error('Error when sending file: ', error); // return object error
                    yield (0, enviarMsgParaDesenvolvedor_1.default)(sock, error);
                }
            }
        }
        if (dadosDosBoletos.current_page < dadosDosBoletos.last_page) {
            const boletosParaEnviar = yield (0, getBoletos_1.default)(diasParaVencer, dadosDosBoletos.current_page + 1);
            yield enviarBoletosParaClientes(sock, boletosParaEnviar);
        }
    });
}
exports.default = enviarBoletosParaClientes;
