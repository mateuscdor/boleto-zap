/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import api from './services/api';
import startWhatsAppSock from './services/whatsapp';
import { currentDatePlus } from './utils/dates';
import downloadFile from './utils/downloadFile';
import deleteFile from './utils/deleteFile';
import setApiAuthHeader from './utils/setApiAuthHeader';
import getAccessToken from './utils/getAccessToken';

require('dotenv').config();

let sock: any;
const hoursToWait = 24; // 24 hours

// Set axios interceptor
api.interceptors.response.use(
  (response) => response,
  // eslint-disable-next-line consistent-return
  async (error) => {
    // if access token is invalid (code 401), generate new token
    if (error.response.data.errCode === 401) {
      const accessToken = await getAccessToken();
      // Set api default Auth Header with new token
      setApiAuthHeader(accessToken);

      // Set originalRequest Authorization header with new token and retry request
      const originalRequest = error.config;
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return api.request(originalRequest);
    }

    console.error(error.response.data);
  }
);

// Create Baileys Socket instance and run program
startWhatsAppSock().then((WAsocket) => {
  WAsocket.ev.on('connection.update', async (update) => {
    if (update.connection === 'open') {
      sock = WAsocket;
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      start();
    }
  });
});

async function getBoletosQueVenceraoDaqui(dias: number) {
  const dataVencimento = currentDatePlus(dias);

  const response = await api.get(
    `/boletos?situacaoBoleto=10&dtTipo=dtVenc&dtIni=${dataVencimento}&dtFim=${dataVencimento}&orderBy=dtVenc,desc`
  );

  const boletos = response.data;

  return { ...boletos, diasParaVencer: dias };
}

async function enviarMsgParaDesenvolvedor(message: string) {
  await sock
    .sendMessage(`55${process.env.TELEFONE_DESENVOLVEDOR}@s.whatsapp.net`, {
      text: message,
    })
    .catch((err: any) => {
      console.error('Error when sending text message: ', err); // return object error
    });
}

async function enviarBoletosParaClientes(dadosDosBoletos: any) {
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

    await downloadFile(linkBoleto);

    // Enviar mensagem
    await sock
      .sendMessage(`55${telefoneCliente}@s.whatsapp.net`, {
        text: `Olá, ${nomeCliente}. Seu boleto vencerá ${mensagemDataVenc}.`,
      })
      .catch(async (erro: any) => {
        console.error('Error when sending text message: ', erro); // return object error
        await enviarMsgParaDesenvolvedor(erro);
      });

    // Enviar boleto
    await sock
      .sendMessage(`55${telefoneCliente}@s.whatsapp.net`, {
        mimetype: 'application/pdf',
        document: { url: './temp/boleto-cliente.pdf' },
        fileName: 'boleto-cliente',
      })
      .catch(async (erro: any) => {
        console.error('Error when sending file: ', erro); // return object error
        await enviarMsgParaDesenvolvedor(erro);
      });

    await deleteFile('./temp/boleto-cliente.pdf');
  }
}

async function start() {
  // Get accessToken and set Authorization header with access_token
  console.log('Set Authorization header with access_token');
  const accessToken = await getAccessToken();
  setApiAuthHeader(accessToken);

  // Get boletos em aberto que vencerão amanhã e enviar para cliente
  console.log('Buscar boletos que vencerão amanhã e enviar para cliente');
  const boletosQueVenceraoAmanha = await getBoletosQueVenceraoDaqui(1);

  await enviarBoletosParaClientes(boletosQueVenceraoAmanha);

  // Get boletos em aberto que vencerão nos próximos 7 dias e enviar para cliente
  console.log('Buscar boletos que vencerão daqui 7 dias e enviar para cliente');
  const boletosQueVenceraoDaqui7Dias = await getBoletosQueVenceraoDaqui(7);
  await enviarBoletosParaClientes(boletosQueVenceraoDaqui7Dias);
  await enviarMsgParaDesenvolvedor('As operações de hoje foram concluídas.');
  // Imprimir log dizendo que as operações do dia foram concluídas
  console.log('As operações de hoje foram concluídas.');
  console.log('==============================================');

  // Repeat the function start every 24 hours
  setTimeout(async () => {
    await start();
  }, hoursToWait * 3600 * 1000);
}
