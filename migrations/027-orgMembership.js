const mongoose = require('mongoose');

exports.up = async function(next) {
  await mongoose.connect(process.env.MONGODB_URI);
  await mongoose.connection.db.collection('orgMemberships').createIndex(
    { expiresAt: 1 },
    {
      name: 'expires_idx',
      sparse: true,
      expireAfterSeconds: 0,
    },
    next
  );
};

exports.down = async function(next) {
  await mongoose.connect(process.env.MONGODB_URI);
  await mongoose.connection.db.collection('orgMemberships').dropIndex('expires_idx', next);
};
