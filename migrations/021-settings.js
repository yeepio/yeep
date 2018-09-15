const mongoose = require('mongoose');

exports.up = async function(next) {
  await mongoose.connect(process.env.MONGODB_URI);
  await mongoose.connection.db.collection('settings').insertOne(
    {
      isUsernameEnabled: true,
      isOrgCreationOpen: true,
    },
    next
  );
};

exports.down = async function(next) {
  await mongoose.connect(process.env.MONGODB_URI);
  await mongoose.connection.db.collection('settings').deleteOne({}, next);
};
