const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const mongoose = require('mongoose');

const readFileAsync = promisify(fs.readFile);

exports.up = async function(next) {
  const passwordResetEmailTemplate = await readFileAsync(
    path.resolve(__dirname, '../server/views/passwordReset.html'),
    {
      encoding: 'utf8',
    }
  );
  await mongoose.connect(process.env.MONGODB_URI);
  await mongoose.connection.db.collection('settings').insertOne(
    {
      isUsernameEnabled: true,
      isOrgCreationOpen: true,
      passwordResetEmailTemplate,
    },
    next
  );
};

exports.down = async function(next) {
  await mongoose.connect(process.env.MONGODB_URI);
  await mongoose.connection.db.collection('settings').deleteOne({}, next);
};
