import { WASocket } from '@adiwajshing/baileys';
import 'dotenv/config';

async function enviarMsgParaDesenvolvedor(sock: WASocket, message: string) {
  await sock
    .sendMessage(`55${process.env.TELEFONE_DESENVOLVEDOR}@s.whatsapp.net`, {
      text: message,
    })
    .catch((err: any) => {
      console.error('Error when sending text message: ', err); // return object error
    });
}

export default enviarMsgParaDesenvolvedor;
