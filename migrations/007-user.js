const mongoose = require('mongoose');

exports.up = async function(next) {
  await mongoose.connect(process.env.MONGODB_URI);
  await mongoose.connection.db.collection('users').createIndex(
    { 'emails.address': 1 },
    {
      unique: true,
      name: 'email_address_uidx',
    },
    next
  );
};

exports.down = async function(next) {
  await mongoose.connect(process.env.MONGODB_URI);
  await mongoose.connection.db
    .collection('users')
    .dropIndex('email_address_uidx', next);
};
