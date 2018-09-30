const mongoose = require('mongoose');

exports.up = async function(next) {
  await mongoose.connect(process.env.MONGODB_URI);
  await mongoose.connection.db.collection('orgMemberships').createIndex(
    { orgId: 1, userId: 1 },
    {
      unique: true,
      name: 'membership_uidx',
    },
    next
  );
};

exports.down = async function(next) {
  await mongoose.connect(process.env.MONGODB_URI);
  await mongoose.connection.db.collection('orgMemberships').dropIndex('membership_uidx', next);
};
