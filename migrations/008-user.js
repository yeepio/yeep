const mongoose = require('mongoose');

exports.up = async function(next) {
  await mongoose.connect(process.env.MONGODB_URI);
  await mongoose.connection.db.collection('users').createIndex(
    { username: 1 },
    {
      unique: true,
      name: 'username_uidx',
    },
    next
  );
};

exports.down = async function(next) {
  await mongoose.connect(process.env.MONGODB_URI);
  await mongoose.connection.db
    .collection('users')
    .dropIndex('username_uidx', next);
};
