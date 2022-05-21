import { Boom } from '@hapi/boom';
import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  useSingleFileAuthState,
} from '@adiwajshing/baileys';

const { state, saveState } = useSingleFileAuthState('./auth_info_multi.json');

// start a connection
async function startWhatsAppSock() {
  // fetch latest version of WA Web
  const { version, isLatest } = await fetchLatestBaileysVersion();
  console.log(`using WA v${version.join('.')}, isLatest: ${isLatest}`);

  const sock = makeWASocket({
    version,
    printQRInTerminal: true,
    auth: state,
  });

  sock.ev.on('connection.update', (update) => {
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
    }
  });

  // listen for when the auth credentials is updated
  sock.ev.on('creds.update', saveState);

  return sock;
}

export default startWhatsAppSock;
