/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { WASocket } from '@adiwajshing/baileys';
import api from '../services/api';
import enviarMsgParaDesenvolvedor from './enviarMsgParaDesenvolvedor';

async function enviarBoletosParaClientes(sock: WASocket, dadosDosBoletos: any) {
  const { diasParaVencer } = dadosDosBoletos.diasParaVencer;

  let mensagemDataVenc;
  if (diasParaVencer === 1) {
    mensagemDataVenc = 'amanhã';
  } else {
    mensagemDataVenc = `daqui a ${diasParaVencer}`;
  }

  for (const element of dadosDosBoletos.data) {
    const dadosDoBoleto = await api.get(`/boletos/${element.codigo}`);

    const linkBoleto = dadosDoBoleto.data.link;
    const codCliente = dadosDoBoleto.data.codContato;

    const { data } = await api.get(`/contatos/${codCliente}`);

    const dadosCliente = data;
    const telefoneCliente = dadosCliente.fones[1];
    const nomeCliente = dadosCliente.nome;

    // Enviar mensagem
    sock
      .sendMessage(`55${telefoneCliente}@s.whatsapp.net`, {
        text: `Olá, ${nomeCliente}. Seu boleto vencerá ${mensagemDataVenc}.`,
      })
      .catch(async (erro: any) => {
        console.error('Error when sending text message: ', erro); // return object error
        await enviarMsgParaDesenvolvedor(sock, erro);
      });

    // Enviar boleto
    sock
      .sendMessage(`55${telefoneCliente}@s.whatsapp.net`, {
        mimetype: 'application/pdf',
        document: { url: linkBoleto },
        fileName: 'boleto-cliente',
      })
      .catch(async (erro: any) => {
        console.error('Error when sending file: ', erro); // return object error
        enviarMsgParaDesenvolvedor(sock, erro);
      });
  }
}

export default enviarBoletosParaClientes;
