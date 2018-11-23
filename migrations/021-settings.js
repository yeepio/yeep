const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFileAsync = promisify(fs.readFile);

export const up = async (db) => {
  const passwordResetInitEmail = await readFileAsync(
    path.resolve(__dirname, '../server/views/passwordResetInit.html'),
    {
      encoding: 'utf8',
    }
  );

  await db.collection('settings').insertOne({
    isUsernameEnabled: true,
    isOrgCreationOpen: true,
    passwordResetInitEmail,
  });
};

export const down = async (db) => {
  await db.collection('settings').deleteOne({});
};
