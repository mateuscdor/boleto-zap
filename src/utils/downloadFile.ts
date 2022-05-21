import util from 'util';
import stream from 'stream';
import fs from 'fs';
import api from '../services/api';

const pipeline = util.promisify(stream.pipeline);

async function downloadFile(fileLink: string) {
  const response = await api.get(`${fileLink}`, {
    responseType: 'stream',
  });

  try {
    await pipeline(
      response.data,
      fs.createWriteStream('./temp/boleto-cliente.pdf')
    );
  } catch (error) {
    console.error('error downloading file:', (error as Error).message);
  }
}

export default downloadFile;
