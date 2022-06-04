/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { WASocket } from '@adiwajshing/baileys';
import parsePhoneNumber from 'libphonenumber-js';
import api from '../services/api';
import enviarMsgParaDesenvolvedor from './enviarMsgParaDesenvolvedor';
import getBoletos from './getBoletos';

interface Data {
  codigo: 3;
  codContato: 4;
  contatoNome: string;
  dtVenc: string;
  dtPgto: string;
  dtEmissao: string;
  valor: number;
  valorPago: number;
  codRecebimentos: number[];
  situacao: number;
}

interface DadosDosBoletos {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  next_page_url: null;
  prev_page_url: null;
  from: number;
  to: number;
  data: Array<Data>;
  diasParaVencer: number;
}

async function enviarBoletosParaClientes(
  sock: WASocket,
  dadosDosBoletos: DadosDosBoletos
) {
  const { diasParaVencer } = dadosDosBoletos;

  let mensagemDataVenc;
  if (diasParaVencer === 1) {
    mensagemDataVenc = 'amanhã';
  } else {
    mensagemDataVenc = `daqui a ${diasParaVencer} dias`;
  }

  for (const element of dadosDosBoletos.data) {
    const dadosBoleto = await api.get(`/boletos/${element.codigo}`);
    const linkBoleto = dadosBoleto.data.link;
    const codCliente = dadosBoleto.data.codContato;

    const dadosCliente = await api.get(`/contatos/${codCliente}`);
    const nomeCliente = dadosCliente.data.nome;
    const telefoneCliente = dadosCliente.data.fones[0];

    const telefoneClienteParsedProperties = parsePhoneNumber(
      telefoneCliente,
      'BR'
    );

    if (telefoneClienteParsedProperties) {
      // Remove o caractere '+' do inicio do numero
      const telefoneClienteValidado =
        telefoneClienteParsedProperties.number.replace('+', '');

      // Enviar mensagem
      try {
        await sock.sendMessage(`${telefoneClienteValidado}@s.whatsapp.net`, {
          text: `Olá, ${nomeCliente}. Seu boleto vencerá ${mensagemDataVenc}.`,
        });
      } catch (error: any) {
        console.error('Error when text message: ', error); // return object error
        await enviarMsgParaDesenvolvedor(sock, error);
      }

      // Enviar boleto
      try {
        await sock.sendMessage(`${telefoneClienteValidado}@s.whatsapp.net`, {
          mimetype: 'application/pdf',
          document: { url: linkBoleto },
          fileName: 'boleto-cliente',
        });
      } catch (error: any) {
        console.error('Error when sending file: ', error); // return object error
        await enviarMsgParaDesenvolvedor(sock, error);
      }
    }
  }

  if (dadosDosBoletos.current_page < dadosDosBoletos.last_page) {
    const boletosParaEnviar = await getBoletos(
      diasParaVencer,
      dadosDosBoletos.current_page + 1
    );

    await enviarBoletosParaClientes(sock, boletosParaEnviar);
  }
}

export default enviarBoletosParaClientes;
