const mongoose = require('mongoose');

exports.up = async function(next) {
  await mongoose.connect(process.env.MONGODB_URI);
  await mongoose.connection.db.collection('orgMemberships').createIndex(
    { userId: 1 },
    {
      name: 'user_idx',
    },
    next
  );
};

exports.down = async function(next) {
  await mongoose.connect(process.env.MONGODB_URI);
  await mongoose.connection.db.collection('orgMemberships').dropIndex('user_idx', next);
};
