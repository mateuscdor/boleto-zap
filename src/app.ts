import { WASocket } from '@adiwajshing/baileys';
import { getAccessToken, setApiAuthHeader } from './services/api';
import createWhatsAppSock from './services/whatsappConnection';
import { currentDate } from './utils/dates';
import enviarBoletosParaClientes from './utils/enviarBoletosParaClientes';
import enviarMsgParaDesenvolvedor from './utils/enviarMsgParaDesenvolvedor';
import getBoletosQueVenceraoDaqui from './utils/getBoletosQueVenceraoDaqui';

async function start(sock: WASocket) {
  console.log('Iniciando operações.');
  await enviarMsgParaDesenvolvedor(sock, 'Iniciando operações.');

  console.log('Set Authorization header with access_token');
  const accessToken = await getAccessToken();
  setApiAuthHeader(accessToken);

  console.log('Buscar boletos que vencerão amanhã e enviar para cliente');
  const boletosQueVenceraoAmanha = await getBoletosQueVenceraoDaqui(1);
  await enviarBoletosParaClientes(sock, boletosQueVenceraoAmanha);

  console.log('Buscar boletos que vencerão daqui 7 dias e enviar para cliente');
  const boletosQueVenceraoDaqui7Dias = await getBoletosQueVenceraoDaqui(7);
  await enviarBoletosParaClientes(sock, boletosQueVenceraoDaqui7Dias);

  await enviarMsgParaDesenvolvedor(
    sock,
    'As operações de hoje foram concluídas.'
  );

  console.log('As operações de hoje foram concluídas.');
  console.log('==============================================');

  const tomorrow5AM = currentDate()
    .plus({ days: 1 })
    .set({ hour: 5, minute: 0 });

  const millisTill5AM = tomorrow5AM
    .diffNow('milliseconds')
    .toObject().milliseconds;

  // Repeat the function start every day at 5AM GMT -03:00 (Brasilia Standard Time)
  setTimeout(async () => {
    await start(sock);
  }, millisTill5AM);
}

// Create whatsappConnection and run program
createWhatsAppSock()
  .then((sock) => {
    start(sock);
  })
  .catch((error) => {
    console.error(error);
  });
