const mongoose = require('mongoose');

exports.up = async function(next) {
  await mongoose.connect(process.env.MONGODB_URI);
  await mongoose.connection.db.collection('credentials').createIndex(
    { user: 1 },
    {
      unique: true,
      name: 'user_password_uidx',
      partialFilterExpression: { type: { $eq: 'PASSWORD' } },
    },
    next
  );
};

exports.down = async function(next) {
  await mongoose.connect(process.env.MONGODB_URI);
  await mongoose.connection.db.collection('credentials').dropIndex('user_password_uidx', next);
};
