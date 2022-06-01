import { Boom } from '@hapi/boom';
import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
  WASocket,
} from '@adiwajshing/baileys';

// Create Baileys Socket instance and run program
async function startWhatsAppSock() {
  const { state, saveCreds } = await useMultiFileAuthState('baileys_auth_info');
  // fetch latest version of WA Web
  const { version, isLatest } = await fetchLatestBaileysVersion();
  console.log(`using WA v${version.join('.')}, isLatest: ${isLatest}`);

  const sock = makeWASocket({
    version,
    printQRInTerminal: true,
    auth: state,
  });

  // listen for when the auth credentials is updated
  sock.ev.on('creds.update', saveCreds);

  return new Promise<WASocket>((resolve) => {
    sock.ev.on('connection.update', async (update) => {
      console.log('connection update', update);

      const { connection, lastDisconnect } = update;

      if (connection === 'close') {
        const shouldReconnect =
          (lastDisconnect?.error as Boom)?.output?.statusCode !==
          DisconnectReason.loggedOut;

        console.log(
          'connection closed due to ',
          lastDisconnect?.error,
          ', reconnecting ',
          shouldReconnect
        );

        if (shouldReconnect) {
          startWhatsAppSock(); // reconnect if not logged out
        } else {
          console.log('Connection closed. You are logged out.');
        }
      } else if (connection === 'open') {
        console.log('opened connection');
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        resolve(sock);
      }
    });
  });
}

export default startWhatsAppSock;
