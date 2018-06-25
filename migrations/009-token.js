const mongoose = require('mongoose');

exports.up = async function(next) {
  await mongoose.connect(process.env.MONGODB_URI);
  await mongoose.connection.db
    .collection('tokens')
    .createIndex({ expiresAt: 1 }, { name: 'expiresAt_idx', expireAfterSeconds: 0 }, next);
};

exports.down = async function(next) {
  await mongoose.connect(process.env.MONGODB_URI);
  await mongoose.connection.db.collection('tokens').dropIndex('expiresAt_idx', next);
};
