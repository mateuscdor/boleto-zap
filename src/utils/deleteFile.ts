import { access, constants } from 'fs';
import { unlink } from 'fs/promises';

const file = 'package.json';

// Check if the file exists in the current directory.
access(file, constants.F_OK, (err) => {
  console.log(`${file} ${err ? 'file does not exist' : 'file exists'}`);
});

async function deleteFile(filePath: string) {
  try {
    await unlink(filePath);
  } catch (error) {
    console.error(
      'there was an error deleting the file:',
      (error as Error).message
    );
  }
}

export default deleteFile;
